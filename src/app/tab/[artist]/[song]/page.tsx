{/* Breadcrumbs */}
<nav className="text-sm text-brand-muted">
  <ol className="flex gap-2 items-center">
    <li><a href="/" className="hover:text-white">Home</a></li>
    <li>/</li>
    <li><a href="/browse" className="hover:text-white">Browse</a></li>
    <li>/</li>
    <li>
      <a href={`/artist/${params.artist}`} className="hover:text-white capitalize">
        {params.artist.replace("-", " ")}
      </a>
    </li>
    <li>/</li>
    <li className="text-white/60 capitalize">{params.song.replace("-", " ")}</li>
  </ol>
</nav>
