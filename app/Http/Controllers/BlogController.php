<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogPost::published()->with('category')->latest();

        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }

        $allPosts = $query->get();

        $featured = null;
        if (!$request->filled('category') && !$request->filled('search') && $allPosts->count() > 0) {
            $featured = $allPosts->first();
            $posts = $allPosts->slice(1)->values();
        } else {
            $posts = $allPosts;
        }

        return Inertia::render('Blog/Index', [
            'featured' => $featured,
            'posts' => $posts,
            'categories' => BlogCategory::all(),
            'filters' => $request->only(['search', 'category'])
        ]);
    }

    public function show($slug)
    {
        $post = BlogPost::published()->with('category')->where('slug', $slug)->firstOrFail();

        // Count Views
        $post->increment('views');

        $related = BlogPost::published()
            ->with('category')
            ->where('blog_category_id', $post->blog_category_id)
            ->where('id', '!=', $post->id)
            ->latest()
            ->take(3)
            ->get();

        return Inertia::render('Blog/Show', [
            'post' => $post,
            'related' => $related
        ]);
    }
}
