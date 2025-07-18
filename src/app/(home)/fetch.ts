export async function getOverviewData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    views: {
      value: 3456,
      growthRate: 0.43,
    },
    profit: {
      value: 4220,
      growthRate: 4.35,
    },
    products: {
      value: 3456,
      growthRate: 2.59,
    },
    users: {
      value: 3456,
      growthRate: -0.95,
    },
  };
}

// GHRS სისტემის რეალური მონაცემები SQL დოკუმენტის მიხედვით
export async function getGHRSOverviewData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    categories: {
      value: 8, // 8 კატეგორია (01-07, 09)
      growthRate: 0, // stable
    },
    videos: {
      value: 1262, // 1,262 ვიდეო
      growthRate: 15.2, // ზრდადია
    },
    users: {
      value: 0, // Users ცხრილი ცარიელია
      growthRate: 0,
    },
    blogs: {
      value: 4, // 4 ბლოგი
      growthRate: 0,
    },
    subcategories: {
      value: 10, // 10 ქვეკატეგორია (Ortho:6, Neuro:4)
      growthRate: 0,
    },
    sets: {
      value: 12, // 12 ცნობილი set (016-027)
      growthRate: 0,
    },
    courses: {
      value: 2, // 2 კურსი (Neurology)
      growthRate: 100, // ახალი ფუნქცია
    },
    sessions: {
      value: 3, // 3 admin session
      growthRate: 0,
    },
  };
}

export async function getChatsData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      name: "Jacob Jones",
      profile: "/images/user/user-01.png",
      isActive: true,
      lastMessage: {
        content: "See you tomorrow at the meeting!",
        type: "text",
        timestamp: "2024-12-19T14:30:00Z",
        isRead: false,
      },
      unreadCount: 3,
    },
    {
      name: "Wilium Smith",
      profile: "/images/user/user-03.png",
      isActive: true,
      lastMessage: {
        content: "Thanks for the update",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 0,
    },
    {
      name: "Johurul Haque",
      profile: "/images/user/user-04.png",
      isActive: false,
      lastMessage: {
        content: "What's up?",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 0,
    },
    {
      name: "M. Chowdhury",
      profile: "/images/user/user-05.png",
      isActive: false,
      lastMessage: {
        content: "Where are you now?",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 2,
    },
    {
      name: "Akagami",
      profile: "/images/user/user-07.png",
      isActive: false,
      lastMessage: {
        content: "Hey, how are you?",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 0,
    },
  ];
}