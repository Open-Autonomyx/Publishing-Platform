// src/publishing/components/SocialFeatures.tsx
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Share button with multiple platforms
export function ShareArticleButton({ articleId, articleTitle, articleSlug }: {
  articleId: string
  articleTitle: string
  articleSlug: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const shareUrl = `https://agennext.com/publishing/article/${articleSlug}`

  const handleShare = async (platform: string) => {
    // Record share in database
    await fetch(`/api/v1/social/articles/${articleId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform })
    })

    // Open share dialog based on platform
    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(articleTitle)}`,
          '_blank',
          'width=600,height=400'
        )
        break
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'width=600,height=400'
        )
        break
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'width=600,height=400'
        )
        break
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(articleTitle)}&body=${encodeURIComponent(shareUrl)}`
        break
      case 'copy':
        navigator.clipboard.writeText(shareUrl)
        alert('Link copied to clipboard!')
        break
    }

    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <span>📤</span>
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Article</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleShare('twitter')}
            className="p-4 rounded-lg border border-gray-200 hover:bg-blue-50 transition text-center"
          >
            <div className="text-2xl mb-2">𝕏</div>
            <div className="text-sm font-medium">Twitter</div>
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="p-4 rounded-lg border border-gray-200 hover:bg-blue-50 transition text-center"
          >
            <div className="text-2xl mb-2">in</div>
            <div className="text-sm font-medium">LinkedIn</div>
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="p-4 rounded-lg border border-gray-200 hover:bg-blue-50 transition text-center"
          >
            <div className="text-2xl mb-2">f</div>
            <div className="text-sm font-medium">Facebook</div>
          </button>
          <button
            onClick={() => handleShare('email')}
            className="p-4 rounded-lg border border-gray-200 hover:bg-blue-50 transition text-center"
          >
            <div className="text-2xl mb-2">✉️</div>
            <div className="text-sm font-medium">Email</div>
          </button>
          <button
            onClick={() => handleShare('copy')}
            className="col-span-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-center"
          >
            <div className="text-2xl mb-2">🔗</div>
            <div className="text-sm font-medium">Copy Link</div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Reaction button with multiple reaction types
export function ReactToArticleButton({ articleId, userReaction, onReactionChange }: {
  articleId: string
  userReaction?: string
  onReactionChange?: (type: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState(userReaction || 'like')

  const reactions = [
    { type: 'like', icon: '❤️', label: 'Like', color: 'text-red-500' },
    { type: 'love', icon: '😍', label: 'Love', color: 'text-red-600' },
    { type: 'insightful', icon: '💡', label: 'Insightful', color: 'text-yellow-500' },
    { type: 'agree', icon: '👍', label: 'Agree', color: 'text-green-500' },
    { type: 'disagree', icon: '🤔', label: 'Disagree', color: 'text-orange-500' }
  ]

  const handleReact = async (type: string) => {
    await fetch(`/api/v1/social/articles/${articleId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    })
    setSelected(type)
    onReactionChange?.(type)
    setIsOpen(false)
  }

  const selectedReaction = reactions.find(r => r.type === selected)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <span>{selectedReaction?.icon || '🤍'}</span>
          React
        </Button>
      </DialogTrigger>
      <DialogContent className="w-80">
        <DialogHeader>
          <DialogTitle>React to Article</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {reactions.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReact(reaction.type)}
              className={`p-4 rounded-lg border-2 transition ${
                selected === reaction.type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">{reaction.icon}</div>
              <div className="text-sm font-medium">{reaction.label}</div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Follow author button
export function FollowAuthorButton({ authorId, authorName, isFollowing: initialFollowing }: {
  authorId: string
  authorName: string
  isFollowing?: boolean
}) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing || false)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleFollow = async () => {
    setIsLoading(true)
    try {
      if (isFollowing) {
        await fetch(`/api/v1/social/users/${authorId}/unfollow`, {
          method: 'DELETE'
        })
      } else {
        await fetch(`/api/v1/social/users/${authorId}/follow`, {
          method: 'POST'
        })
      }
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error('Failed to toggle follow:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleToggleFollow}
      disabled={isLoading}
      variant={isFollowing ? 'outline' : 'default'}
      className="gap-2"
    >
      <span>{isFollowing ? '✓' : '+'}</span>
      {isFollowing ? 'Following' : `Follow ${authorName}`}
    </Button>
  )
}

// Bookmark article button
export function BookmarkArticleButton({ articleId, isBookmarked: initialBookmarked }: {
  articleId: string
  isBookmarked?: boolean
}) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked || false)

  const handleToggleBookmark = async () => {
    try {
      if (isBookmarked) {
        await fetch(`/api/v1/publishing/articles/${articleId}/bookmark`, {
          method: 'DELETE'
        })
      } else {
        await fetch(`/api/v1/publishing/articles/${articleId}/bookmark`, {
          method: 'POST'
        })
      }
      setIsBookmarked(!isBookmarked)
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
    }
  }

  return (
    <Button
      onClick={handleToggleBookmark}
      variant="ghost"
      className="gap-2"
    >
      <span>{isBookmarked ? '🔖' : '🔗'}</span>
      {isBookmarked ? 'Saved' : 'Save'}
    </Button>
  )
}

// Notification bell with count
export function NotificationBell({ count = 0, onClick }: {
  count?: number
  onClick?: () => void
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className="relative p-2 text-gray-700 hover:text-gray-900"
          >
            <span className="text-2xl">🔔</span>
            {count > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{count} new notifications</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Social stats display
export function ArticleSocialStats({ stats }: {
  stats: {
    views: number
    likes: number
    comments: number
    shares: number
  }
}) {
  return (
    <div className="flex gap-6 text-sm text-gray-600">
      <div className="flex items-center gap-1">
        <span>👁️</span>
        <span>{stats.views.toLocaleString()} views</span>
      </div>
      <div className="flex items-center gap-1">
        <span>❤️</span>
        <span>{stats.likes.toLocaleString()} likes</span>
      </div>
      <div className="flex items-center gap-1">
        <span>💬</span>
        <span>{stats.comments.toLocaleString()} comments</span>
      </div>
      <div className="flex items-center gap-1">
        <span>📤</span>
        <span>{stats.shares.toLocaleString()} shares</span>
      </div>
    </div>
  )
}

// Author follow card
export function AuthorFollowCard({ author }: {
  author: {
    id: string
    name: string
    image: string
    bio: string
    followers: number
    isFollowing?: boolean
  }
}) {
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
      <img
        src={author.image}
        alt={author.name}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex-1">
        <h4 className="font-bold text-gray-900">{author.name}</h4>
        <p className="text-sm text-gray-600">{author.bio}</p>
        <p className="text-xs text-gray-500 mt-1">
          {author.followers.toLocaleString()} followers
        </p>
      </div>
      <FollowAuthorButton
        authorId={author.id}
        authorName={author.name}
        isFollowing={author.isFollowing}
      />
    </div>
  )
}

// Comment with reactions
export function CommentWithReactions({ comment }: {
  comment: {
    id: string
    author: string
    authorImage: string
    content: string
    likes: number
    createdAt: string
  }
}) {
  return (
    <div className="border-b border-gray-200 pb-6">
      <div className="flex gap-4">
        <img
          src={comment.authorImage}
          alt={comment.author}
          className="w-10 h-10 rounded-full flex-shrink-0"
        />
        <div className="flex-1">
          <div className="font-bold text-gray-900">{comment.author}</div>
          <div className="text-sm text-gray-500 mb-2">
            {new Date(comment.createdAt).toLocaleDateString()}
          </div>
          <p className="text-gray-700 mb-3">{comment.content}</p>
          <div className="flex gap-4 text-sm">
            <button className="text-gray-500 hover:text-gray-700 font-medium">
              👍 {comment.likes}
            </button>
            <button className="text-gray-500 hover:text-gray-700 font-medium">
              💬 Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Trending authors widget
export function TrendingAuthorsWidget({ limit = 5 }: { limit?: number }) {
  const [authors, setAuthors] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    fetch(`/api/v1/social/trending-authors?limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setAuthors(data.authors || [])
        setIsLoading(false)
      })
  }, [limit])

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-gray-900">Trending Authors</h3>
      {authors.map((author: any) => (
        <AuthorFollowCard
          key={author.author}
          author={{
            id: author.author,
            name: author.author,
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.author}`,
            bio: `${author.article_count} articles · ${author.total_views.toLocaleString()} views`,
            followers: 0,
            isFollowing: false
          }}
        />
      ))}
    </div>
  )
}
