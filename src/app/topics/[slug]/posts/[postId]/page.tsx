import CommentCreateForm from "@/components/comments/CommentCreateForm";
import CommentList from "@/components/comments/CommentList";
import PostShow from "@/components/posts/PostShow";
import PostShowLoading from "@/components/posts/PostShowLoading";
import { fetchCommentsByPostId } from "@/db/queries/comment";
import { paths } from "@/paths";
import Link from "next/link";
import { Suspense } from "react";

type Props = {
  params: {
    slug: string;
    postId: string;
  };
};

export default function PostsPage({ params }: Props) {
  const { slug, postId } = params;

  return (
    <div className="space-y-3">
      <Link className="underline decoration-solid" href={paths.topicShow(slug)}>
        {"< "}Back to {slug}
      </Link>

      <Suspense fallback={<PostShowLoading />}>
        <PostShow postId={postId} />
      </Suspense>

      <CommentCreateForm postId={postId} startOpen />

      <CommentList fetchData={() => fetchCommentsByPostId(postId)} />
    </div>
  );
}
