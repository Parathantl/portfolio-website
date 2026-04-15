interface SkillCardProps {
  skill: {
    name: string;
    category: string;
    proficiencyLevel: number;
    iconUrl?: string;
  };
}

export default function SkillCard({ skill }: SkillCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-4 mb-3">
        {skill.iconUrl && (
          <img
            src={skill.iconUrl}
            alt={skill.name}
            className="w-12 h-12 object-contain"
          />
        )}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {skill.name}
        </h3>
      </div>

      {/* Proficiency Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Proficiency</span>
          <span>{skill.proficiencyLevel}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${skill.proficiencyLevel}%` }}
          />
        </div>
      </div>
    </div>
  );
}
