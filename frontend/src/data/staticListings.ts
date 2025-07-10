import { Listing } from "../pages/Listings/Listings";
import dellMonitorImg from "../assets/dell monitor.webp";
import woodenBookshelfImg from "../assets/wooden bookshelf.webp";
import microwaveOvenImg from "../assets/microwave-oven.webp";
import standingFanImg from "../assets/standing fan.webp";
import beanBagChairImg from "../assets/black-bean-bag-chair.webp";
import riceCookerImg from "../assets/rice-cooker.webp";

// Function to generate a date N days ago from now
const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const staticListings: Listing[] = [
  {
    id: "static-1",
    title: "Dell Monitor",
    description:
      "Experience crisp visuals and vibrant colors with this 24-inch Dell LED monitor. Perfect for study sessions, gaming, or streaming your favorite shows. Lightly used and in excellent condition—ideal for any student workspace!",
    category: "Electronics",
    price: "80",
    email: "admin@dal.ca",
    image: dellMonitorImg,
    date: daysAgo(7), 
  },
  {
    id: "static-2",
    title: "Wooden Bookshelf",
    description:
      "Organize your textbooks, novels, and decor with this tall, sturdy 5-shelf wooden bookshelf. Its classic design fits any dorm or apartment, offering both style and ample storage for your academic life.",
    category: "Furniture",
    price: "60",
    email: "admin@dal.ca",
    image: woodenBookshelfImg,
    date: daysAgo(4), 
  },
  {
    id: "static-3",
    title: "Microwave Oven",
    description:
      "Quickly heat up meals or snacks with this reliable 700W microwave oven. Compact and efficient, it's a must-have for busy students who want convenience in their kitchen setup.",
    category: "Kitchen",
    price: "35",
    email: "admin@dal.ca",
    image: microwaveOvenImg,
    date: daysAgo(4), 
  },
  {
    id: "static-4",
    title: "Standing Fan",
    description:
      "Stay cool during those warm Halifax days with this adjustable-height standing fan. Whisper-quiet operation and easy controls make it perfect for dorm rooms or shared apartments.",
    category: "Appliances",
    price: "25",
    email: "admin@dal.ca",
    image: standingFanImg,
    date: daysAgo(9), 
  },
  {
    id: "static-5",
    title: "Bean Bag Chair",
    description:
      "Sink into comfort with this oversized bean bag chair—great for movie nights, gaming, or just relaxing after class. Durable fabric and modern style make it a cozy addition to any student space.",
    category: "Furniture",
    price: "40",
    email: "admin@dal.ca",
    image: beanBagChairImg,
    date: daysAgo(8), 
  },
  {
    id: "static-6",
    title: "Rice Cooker",
    description:
      "Enjoy perfectly cooked rice every time with this compact automatic rice cooker. Ideal for quick meals and meal prep, it's a kitchen essential for students on the go.",
    category: "Kitchen",
    price: "30",
    email: "admin@dal.ca",
    image: riceCookerImg,
    date: daysAgo(2), 
  },
];
