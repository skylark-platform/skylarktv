import { Testimonial } from "../../types/gql";
import { FirstValidImage } from "./image";

export interface TestimonialCardProps {
  testimonial: Testimonial;
}

export const TestimonialCard = ({ testimonial }: TestimonialCardProps) => (
  <div className="mx-auto flex w-full max-w-md flex-col items-center md:items-start">
    <FirstValidImage
      className="mb-4 max-h-28 w-1/2 object-cover md:mb-6 md:h-48 md:w-full"
      images={testimonial.images?.objects}
    />
    <h3 className="text-2xl font-semibold md:text-3xl">{testimonial.title}</h3>
    <p className="text-base font-semibold uppercase text-gray-600 md:h-8 md:text-lg">
      {testimonial.industry}
    </p>
    <p className="text-center md:text-left">{testimonial.description}</p>
  </div>
);
