import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';

import lop1 from '@/assets/images/courses/lop1.jpg';
import lop2 from '@/assets/images/courses/lop2.jpg';
import lop3 from '@/assets/images/courses/lop3.jpg';
import lop4 from '@/assets/images/courses/lop4.jpg';

const HomeSlider = () => {
  const slides = [
    {
      id: 1,
      title: "Lớp Tiếng Anh cho trẻ 4-6 tuổi",
      description: "Khai giảng ngày 15/06/2023",
      image: lop1,
    },
    {
      id: 2,
      title: "Lớp Tiếng Anh giao tiếp 7-9 tuổi",
      description: "Khai giảng ngày 20/06/2023",
      image: lop2,
    },
    {
      id: 3,
      title: "Lớp Tiếng Anh học thuật 10-12 tuổi",
      description: "Khai giảng ngày 25/06/2023",
      image: lop3,
    },
    {
      id: 4,
      title: "Lớp Tiếng Anh giao tiếp 13-15 tuổi",
      description: "Khai giảng ngày 30/06/2023",
      image: lop4,
    }
  ];

  return (
    <Carousel className="w-full">
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.id}>
            <div className="relative h-[400px] w-full overflow-hidden rounded-lg">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-8 bg-opacity-60 text-white">
                <h3 className="text-3xl font-bold mb-2">{slide.title}</h3>
                <p className="text-xl">{slide.description}</p>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center mt-4">
        <CarouselPrevious className="relative mr-4 left-0 translate-y-0" />
        <CarouselNext className="relative ml-4 right-0 translate-y-0" />
      </div>
    </Carousel>
  );
};

export default HomeSlider;
