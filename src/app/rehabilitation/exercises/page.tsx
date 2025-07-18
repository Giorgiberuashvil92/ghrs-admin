"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Exercise {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
}

export default function RehabilitationExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: "1",
      title: "გულმკერდის გაშლა",
      description: "ვარჯიში გულმკერდის კუნთების გასაძლიერებლად",
      image: "/images/exercises/chest.jpg",
      category: "ორთოპედია"
    },
    // დანარჩენი ვარჯიშები დაემატება ბაზიდან
  ]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ვარჯიშები</h1>
        <Button>ვარჯიშის დამატება</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>სურათი</TableHead>
            <TableHead>სათაური</TableHead>
            <TableHead>აღწერა</TableHead>
            <TableHead>კატეგორია</TableHead>
            <TableHead>მოქმედებები</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exercises.map((exercise) => (
            <TableRow key={exercise.id}>
              <TableCell>
                <Image
                  src={exercise.image}
                  alt={exercise.title}
                  width={100}
                  height={100}
                  className="rounded-lg object-cover"
                />
              </TableCell>
              <TableCell>{exercise.title}</TableCell>
              <TableCell>{exercise.description}</TableCell>
              <TableCell>{exercise.category}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline">რედაქტირება</Button>
                  <Button variant="destructive">წაშლა</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 