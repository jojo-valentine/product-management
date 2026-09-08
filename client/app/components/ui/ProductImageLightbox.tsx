"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

interface ProductImage {
  uuid: string;
  path: string;
  image: string;
}

interface ProductImageLightboxProps {
  images: ProductImage[];
  apiUrl: string;
}

export default function ProductImageLightbox({
  images,
  apiUrl,
}: ProductImageLightboxProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const slides = images.map((img) => ({
    src: `${apiUrl}/uploads/${img.path}/${img.image}`,
  }));

  const handleOpen = (index: number) => {
    setIndex(index);
    setOpen(true);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {images.map((img, index) => (
          <img
            key={img.uuid}
            src={`${apiUrl}/uploads/${img.path}/${img.image}`}
            alt="Product"
            className="h-12 w-12 cursor-pointer rounded-md border object-cover hover:opacity-80"
            onClick={() => handleOpen(index)}
          />
        ))}
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
        plugins={[Zoom, Thumbnails, Fullscreen]}
      />
    </>
  );
}
