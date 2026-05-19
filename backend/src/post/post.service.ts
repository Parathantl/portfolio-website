import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Category } from 'src/category/entities/category.entity';
import { MasterCategory } from 'src/master-category/entities/master-category.entity';
import { Repository, In } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class PostService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor(
    @InjectRepository(Post) private readonly repo: Repository<Post>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(MasterCategory)
    private readonly masterCategoryRepo: Repository<MasterCategory>,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async create(createPostDto: CreatePostDto, user: User) {
    const post = new Post();
    post.userId = user.id;

    const { categoryIds, ...postData } = createPostDto;
    Object.assign(post, postData);

    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.categoryRepo.find({
        where: { id: In(categoryIds) },
      });

      if (categories.length === 0) {
        throw new BadRequestException('No valid categories found');
      }

      // Validate all categories belong to the same master category
      const masterCategoryIds = [
        ...new Set(categories.map((cat) => cat.masterCategoryId)),
      ];
      if (masterCategoryIds.length > 1) {
        throw new BadRequestException(
          'All categories must belong to the same master category',
        );
      }

      post.categories = categories;
    }

    return await this.repo.save(post);
  }

  async findAll(query: any = {}) {
    const qb = this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.categories', 'category')
      .leftJoinAndSelect('category.masterCategory', 'masterCategory')
      .leftJoinAndSelect('post.user', 'user');

    // Search by title (case-insensitive). Accept either `q` or legacy `title`.
    const search = query.q ?? query.title;
    if (search) {
      qb.andWhere('post.title ILIKE :search', { search: `%${search}%` });
    }

    if (query.category) {
      qb.andWhere('category.title = :cat', { cat: query.category });
    }

    if (query.masterCategory) {
      qb.andWhere('masterCategory.slug = :masterCat', {
        masterCat: query.masterCategory,
      });
    }

    if (query.sort) {
      qb.orderBy('post.title', String(query.sort).toUpperCase() as 'ASC' | 'DESC');
    } else {
      qb.orderBy('post.createdOn', 'DESC');
    }

    // Paginated mode is opt-in via the `page` query param so existing callers
    // (admin lists, sitemap, etc.) keep getting the full array.
    if (query.page !== undefined) {
      const page = Math.max(1, parseInt(query.page, 10) || 1);
      const limit = Math.min(
        50,
        Math.max(1, parseInt(query.limit, 10) || 9),
      );
      qb.skip((page - 1) * limit).take(limit);
      const [items, total] = await qb.getManyAndCount();
      return {
        items,
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      };
    }

    return qb.getMany();
  }

  async findRecent(limit: number = 3): Promise<Post[]> {
    // Posts whose master category is flagged showInRecentPosts; if no master
    // category is flagged yet, fall back to most-recent posts so the homepage
    // isn't empty.
    const flaggedCount = await this.masterCategoryRepo.count({
      where: { showInRecentPosts: true },
    });

    const qb = this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.categories', 'category')
      .leftJoinAndSelect('category.masterCategory', 'masterCategory')
      .leftJoinAndSelect('post.user', 'user')
      .orderBy('post.createdOn', 'DESC')
      .limit(limit);

    if (flaggedCount > 0) {
      qb.innerJoin('post.categories', 'flaggedCategory')
        .innerJoin(
          'flaggedCategory.masterCategory',
          'flaggedMaster',
          'flaggedMaster.showInRecentPosts = true',
        );
    }

    return qb.getMany();
  }

  async findOne(id: number) {
    const post = this.repo.findOne({ where: { id } });
    if (!post) {
      throw new BadRequestException('Post not found');
    }
    return post;
  }

  async uploadPhoto(file: Express.Multer.File) {
    return { success: true, file };
  }

  async findBySlug(slug: string) {
    try {
      const post = await this.repo.findOneOrFail({
        where: { slug },
        relations: ['categories', 'categories.masterCategory', 'user'],
      });
      return post;
    } catch (err) {
      throw new BadRequestException(`Post with slug ${slug} not found`);
    }
  }

  async findRelatedPosts(slug: string, limit: number = 4): Promise<Post[]> {
    // Get the current post with its categories
    const currentPost = await this.repo.findOne({
      where: { slug },
      relations: ['categories', 'categories.masterCategory'],
    });

    if (!currentPost) {
      throw new BadRequestException('Post not found');
    }

    // Handle posts with no categories - return recent posts instead
    if (!currentPost.categories || currentPost.categories.length === 0) {
      return await this.repo
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.categories', 'category')
        .leftJoinAndSelect('category.masterCategory', 'masterCategory')
        .leftJoinAndSelect('post.user', 'user')
        .where('post.id != :currentPostId', { currentPostId: currentPost.id })
        .orderBy('post.createdOn', 'DESC')
        .limit(limit)
        .getMany();
    }

    // Get category IDs and master category IDs
    const categoryIds = currentPost.categories.map((cat) => cat.id);
    const masterCategoryIds = [
      ...new Set(
        currentPost.categories
          .map((cat) => cat.masterCategoryId)
          .filter((id): id is number => id !== null && id !== undefined),
      ),
    ];

    // Build query for related posts
    const queryBuilder = this.repo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.categories', 'category')
      .leftJoinAndSelect('category.masterCategory', 'masterCategory')
      .leftJoinAndSelect('post.user', 'user')
      .where('post.id != :currentPostId', { currentPostId: currentPost.id });

    // Add category/master category filter if we have any
    if (categoryIds.length > 0 || masterCategoryIds.length > 0) {
      queryBuilder.andWhere(
        '(category.id IN (:...categoryIds) OR category.masterCategoryId IN (:...masterCategoryIds))',
        {
          categoryIds: categoryIds.length > 0 ? categoryIds : [0],
          masterCategoryIds:
            masterCategoryIds.length > 0 ? masterCategoryIds : [0],
        },
      );
    }

    const relatedPosts = await queryBuilder
      .orderBy('RANDOM()') // PostgreSQL random function
      .limit(limit)
      .getMany();

    return relatedPosts;
  }

  async update(slug: string, updatePostDto: UpdatePostDto) {
    const post = await this.repo.findOne({
      where: { slug },
      relations: ['categories'],
    });

    if (!post) {
      throw new BadRequestException('Post not found');
    }

    post.modifiedOn = new Date(Date.now());

    const { categoryIds, ...postData } = updatePostDto as any;

    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.categoryRepo.find({
        where: { id: In(categoryIds) },
      });

      if (categories.length === 0) {
        throw new BadRequestException('No valid categories found');
      }

      // Validate all categories belong to the same master category
      const masterCategoryIds = [
        ...new Set(categories.map((cat) => cat.masterCategoryId)),
      ];
      if (masterCategoryIds.length > 1) {
        throw new BadRequestException(
          'All categories must belong to the same master category',
        );
      }

      post.categories = categories;
    }

    Object.assign(post, postData);
    return this.repo.save(post);
  }

  async remove(id: number) {
    const post = await this.repo.findOne({ where: { id } });

    if (!post) {
      throw new BadRequestException('Post not found');
    }

    await this.repo.remove(post);

    return { success: true, post };
  }

  async generateExcerpt(
    title: string,
    content: string,
  ): Promise<{ excerpt: string }> {
    if (!this.genAI) {
      throw new BadRequestException(
        'Gemini API key not configured. Set GEMINI_API_KEY environment variable.',
      );
    }

    // Strip Markdown syntax for the AI prompt (best-effort, just enough for context).
    const plainText = content
      .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
      .replace(/`[^`]*`/g, ' ') // inline code
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links → text
      .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1') // emphasis
      .replace(/^#{1,6}\s+/gm, '') // headings
      .replace(/^>\s+/gm, '') // blockquotes
      .replace(/^[-*+]\s+/gm, '') // bullets
      .replace(/^\d+\.\s+/gm, '') // ordered list
      .replace(/<[^>]+>/g, ' ') // any stray HTML
      .replace(/\s+/g, ' ')
      .trim();
    const truncatedText = plainText.substring(0, 3000);

    const prompt = `You are an SEO expert. Generate a concise, compelling excerpt (2-3 sentences, max 160 characters) for the following blog post. The excerpt should:
- Summarize the key value/insight of the post
- Be written in third person or neutral tone
- Be optimized for search engines and AI answer engines
- Not start with "This post" or "This article"
- Be a standalone description that makes sense without reading the full post

Title: ${title}

Content:
${truncatedText}

Respond with ONLY the excerpt text, no quotes, no labels, no explanation.`;

    // Try models in order of preference (fallback if quota exhausted or model unavailable)
    const models = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-2.5-flash-preview-04-17'];

    for (const modelName of models) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const excerpt = response.text().trim();

        // Ensure it's not too long
        const finalExcerpt =
          excerpt.length > 300 ? excerpt.substring(0, 297) + '...' : excerpt;

        return { excerpt: finalExcerpt };
      } catch (error: any) {
        const isRetryable = error?.status === 429 || error?.status === 404;
        console.error(
          `Gemini API error (${modelName}):`,
          isRetryable
            ? `${error?.status === 429 ? 'Quota exceeded' : 'Model not found'}, trying next model...`
            : error,
        );

        // Only try the next model if it's a quota or model-not-found error
        if (!isRetryable) {
          throw new BadRequestException(
            'Failed to generate excerpt. Please try again or write one manually.',
          );
        }
      }
    }

    // Fallback: generate a basic excerpt from content text
    console.warn('All Gemini models unavailable, using text extraction fallback');
    const sentences = truncatedText
      .replace(/\s+/g, ' ')
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.length > 10);

    const fallbackExcerpt =
      sentences.length > 0
        ? sentences.slice(0, 2).join(' ').substring(0, 160).trim()
        : truncatedText.substring(0, 160).trim();

    return {
      excerpt:
        fallbackExcerpt + (truncatedText.length > 160 ? '...' : ''),
    };
  }
}
