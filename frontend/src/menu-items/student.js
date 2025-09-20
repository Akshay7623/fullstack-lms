import { ProfileCircle } from 'iconsax-react';

const icons = {
  student: ProfileCircle
};


const pages = {
  id: 'student',
  title: 'student',
  type: 'group',
  icon: icons.page,
  children: [
    
    {
      id: 'student',
      title: 'student',
      type: 'collapse',
      icon: icons.student,
      children: [
        {
          id: 'student-details',
          title: 'student-details',
          type: 'item',
          url: '/student/view'
        },
        {
          id: 'pending-enrollments',
          title: 'pending-enrollments',
          type: 'item',
          url: '/student/pending-enrollments'
        }
      ]
    },
  ]
};

export default pages;
