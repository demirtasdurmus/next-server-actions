"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { paths } from "@/paths";
import type { Topic } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const createTopicSchema = z.object({
  name: z
    .string()
    .min(3)
    .regex(/[a-z-]/, {
      message: "Must be lowercase letters or dashes without spaces.",
    }),
  description: z.string().min(10),
});

export interface ICreateTopicFormState {
  errors: {
    _form?: string[];
    name?: string[];
    description?: string[];
  };
}

export async function creataTopic(
  formState: ICreateTopicFormState,
  formData: FormData
): Promise<ICreateTopicFormState> {
  const result = createTopicSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
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

  let topic: Topic;
  try {
    topic = await db.topic.create({
      data: {
        slug: result.data.name,
        description: result.data.description,
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

  // revalidate --> homePage\
  revalidatePath(paths.home());
  redirect(paths.topicShow(topic.slug));
}
