import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [
          {
            title: "Home",
            url: "/",
          },
        ],
      },
      {
        title: "Rehabilitation",
        icon: Icons.FourCircle,
        items: [
          {
            title: "Categories",
            url: "/rehabilitation/categories",
          },
          {
            title: "Popular Exercises",
            url: "/rehabilitation/popular-exercises",
          },
          {
            title: "Exercises",
            url: "/rehabilitation/exercises",
          },
          {
            title: "Videos",
            url: "/pages/videos",
          },
        ],
      },
      {
        title: "Professional Development",
        icon: Icons.Alphabet,
        items: [
          {
            title: "კურსების მართვა",
            url: "/admin/courses",
          },
          {
            title: "ინსტრუქტორების მართვა",
            url: "/admin/instructors",
          },
          {
            title: "კურსები",
            url: "/pages/courses",
          },
        ],
      },
      {
        title: "Content Management",
        icon: Icons.PieChart,
        items: [
          {
            title: "Articles",
            url: "/admin/articles",
          },
          {
            title: "Blogs",
            url: "/admin/blogs",
          },
        ],
      },
    ],
  },
  {
    label: "SETTINGS",
    items: [
      {
        title: "Profile",
        url: "/profile",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Settings",
        icon: Icons.Alphabet,
        items: [
          {
            title: "General",
            url: "/pages/settings",
          },
        ],
      },
    ],
  },
];
