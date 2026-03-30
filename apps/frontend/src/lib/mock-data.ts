import { fakerFR as faker } from "@faker-js/faker";

export interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  rating: number;
  provider: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  image: string;
}

const CATEGORIES = ["ÉLECTRICITÉ", "MÉNAGE", "ARCHITECTURE", "TECH", "BIEN-ÊTRE", "PLOMBERIE"];

export const generateMockServices = (count: number = 6): Service[] => {
  return Array.from({ length: count }).map(() => ({
    id: faker.string.uuid(),
    title: faker.person.jobTitle() + " " + faker.company.catchPhraseAdjective(),
    category: faker.helpers.arrayElement(CATEGORIES),
    description: faker.lorem.sentence(12),
    price: faker.number.int({ min: 10, max: 150 }),
    rating: faker.number.float({ min: 4, max: 5, fractionDigits: 1 }),
    provider: {
      name: faker.person.fullName(),
      avatar: `https://i.pravatar.cc/150?u=${faker.string.uuid()}`,
      verified: faker.datatype.boolean(0.8),
    },
    image: `https://images.unsplash.com/photo-${faker.number.int({ min: 1500000000000, max: 1600000000000 })}?auto=format&fit=crop&w=800&q=80`,
  }));
};
