interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: JSX.Element;
  gradient: string;
  onViewDetail?: () => void;
}

export default function StatCard({
  title,
  value,
  change,
  changeType = 'positive',
  icon,
  gradient,
  onViewDetail,
}: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            {change && (
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  changeType === 'positive'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}
              >
                {change}
              </span>
            )}
          </div>
        </div>
      </div>
      {onViewDetail && (
        <button
          onClick={onViewDetail}
          className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition group"
        >
          <span>View Detail</span>
          <svg
            className="w-4 h-4 transform group-hover:translate-x-1 transition"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
