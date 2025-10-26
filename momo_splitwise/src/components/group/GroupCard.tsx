import { Link } from 'react-router-dom';
import { Users, Calendar, ArrowRight } from 'lucide-react';
import type { Group } from '../../types';
import { formatDate } from '../../utils/calculations';

interface GroupCardProps {
  group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({ group }) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
              <p className="text-sm text-gray-500">{group.description}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{group.members.length} members</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(group.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{group.currency}</span>
          <Link
            to={`/groups/${group.id}`}
            className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            <span>View Group</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;