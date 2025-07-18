import { compactFormat } from "@/lib/format-number";
import { getGHRSOverviewData } from "../../fetch";
import { OverviewCard } from "./card";
import * as icons from "./icons";

export async function OverviewCardsGroup() {
  const { categories, videos, users, blogs, subcategories, sets, courses, sessions } = await getGHRSOverviewData();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="კატეგორიები"
        data={{
          ...categories,
          value: categories.value,
        }}
        Icon={icons.Categories}
      />

      <OverviewCard
        label="ვიდეოები" 
        data={{
          ...videos,
          value: compactFormat(videos.value),
        }}
        Icon={icons.Videos}
      />

      <OverviewCard
        label="მომხმარებლები"
        data={{
          ...users,
          value: users.value,
        }}
        Icon={icons.Users}
      />

      <OverviewCard
        label="ბლოგები"
        data={{
          ...blogs,
          value: blogs.value,
        }}
        Icon={icons.Blogs}
      />

      <OverviewCard
        label="ქვეკატეგორიები"
        data={{
          ...subcategories,
          value: subcategories.value,
        }}
        Icon={icons.Subcategories}
      />

      <OverviewCard
        label="ვარჯიშების Sets"
        data={{
          ...sets,
          value: sets.value,
        }}
        Icon={icons.Sets}
      />

      <OverviewCard
        label="კურსები"
        data={{
          ...courses,
          value: courses.value,
        }}
        Icon={icons.Courses}
      />

      <OverviewCard
        label="სესიები"
        data={{
          ...sessions,
          value: sessions.value,
        }}
        Icon={icons.Sessions}
      />
    </div>
  );
}
