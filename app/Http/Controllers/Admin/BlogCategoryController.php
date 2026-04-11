<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BlogCategoryController extends Controller
{
    public function index()
    {
        return redirect()->route('admin.blog.index');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255'
        ]);
        $validated['slug'] = Str::slug($validated['name']);

        // Prevent duplicate slugs
        if (BlogCategory::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] .= '-' . uniqid();
        }

        BlogCategory::create($validated);

        return back()->with('success', 'Category created successfully!');
    }

    public function update(Request $request, BlogCategory $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255'
        ]);
        $validated['slug'] = Str::slug($validated['name']);

        if (BlogCategory::where('slug', $validated['slug'])->where('id', '!=', $category->id)->exists()) {
            $validated['slug'] .= '-' . uniqid();
        }

        $category->update($validated);
        return back()->with('success', 'Category updated successfully!');
    }

    public function destroy(BlogCategory $category)
    {
        $category->delete();
        return back()->with('success', 'Category deleted successfully!');
    }
}
