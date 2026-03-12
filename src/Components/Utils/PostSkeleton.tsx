const PostSkeleton = () => {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-black/10 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-white/10" />
          <div className="h-3 w-24 rounded bg-white/10" />
        </div>
        <div className="h-3 w-20 rounded bg-white/10" />
      </div>
      <div className="mt-4 h-5 w-3/4 rounded bg-white/10" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-3 w-5/6 rounded bg-white/10" />
        <div className="h-3 w-4/6 rounded bg-white/10" />
      </div>
      <div className="mt-4 flex gap-3">
        <div className="h-8 w-24 rounded-xl bg-white/10" />
        <div className="h-8 w-24 rounded-xl bg-white/10" />
        <div className="h-8 w-24 rounded-xl bg-white/10" />
      </div>
    </div>
  );
};

export default PostSkeleton;
