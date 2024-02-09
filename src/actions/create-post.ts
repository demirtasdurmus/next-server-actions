"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { paths } from "@/paths";
import type { Post } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
});

export interface ICreatePostFormState {
  errors: {
    _form?: string[];
    title?: string[];
    content?: string[];
  };
}

export async function creataPost(
  slug: string,
  formState: ICreatePostFormState,
  formData: FormData
): Promise<ICreatePostFormState> {
  const result = createPostSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const session = await auth();
  if (!session || !session.user) {
    return {
      errors: {
        _form: ["You must be signed in to perform this action."],
      },
    };
  }

  let post: Post;
  try {
    const topic = await db.topic.findFirst({
      where: {
        slug,
      },
    });

    if (!topic) {
      throw new Error("Topic not found.");
    }

    post = await db.post.create({
      data: {
        title: result.data.title,
        content: result.data.content,
        userId: session.user.id,
        topicId: topic.id,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return {
        errors: {
          _form: [error.message],
        },
      };
    }

    return {
      errors: {
        _form: ["Something went wrong"],
      },
    };
  }

  // revalidate --> postShow page
  revalidatePath(paths.topicShow(slug));
  redirect(paths.postShow(slug, post.id));
}
