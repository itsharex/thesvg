import { getAllIcons, getAllCategories, getIconCount } from "@/lib/icons";
import { HomeContent } from "@/components/home-content";

export default function Home() {
  const icons = getAllIcons();
  const categories = getAllCategories();
  const count = getIconCount();

  return <HomeContent icons={icons} categories={categories} count={count} />;
}
