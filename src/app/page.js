import Homepage from "@/components/Homepage";
import { Metadata } from 'next';

export const metadata = {
  title: "WearHouse - Quality Wears for Every Occasion",
  description: "Discover the latest trends in fashion. We offer a wide range of clothes, trousers, and accessories for men and women. Shop now for quality wears at affordable prices.",
  keywords: "fashion, clothing, wears, trousers, accessories, online shopping, ecommerce",
  openGraph: {
    title: "WearHouse - Quality Wears for Every Occasion",
    description: "Your one-stop shop for stylish and affordable clothing. Find the perfect outfit for any occasion.",
    type: "website",
  },
};

export default function Home() {
  return <Homepage />;
}
