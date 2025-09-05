interface SkillTagProps {
  skill: string;
  level: number;
}

export function SkillTag({ skill, level }: SkillTagProps) {
  const getLevelColor = (level: number) => {
    if (level >= 4) return 'bg-green-100 text-green-800 border-green-200';
    if (level >= 3) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (level >= 2) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getLevelText = (level: number) => {
    if (level >= 4) return 'Expert';
    if (level >= 3) return 'Advanced';
    if (level >= 2) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getLevelColor(level)}`}
    >
      <span>{skill}</span>
      <span className="text-xs opacity-75">({getLevelText(level)})</span>
    </div>
  );
}
