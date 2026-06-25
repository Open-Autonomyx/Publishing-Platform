# 🌐 Complete URL Routing & Navigation Guide

**All URLs and routing for the Creative Platform Publishing System**

---

## 📍 Base URL

```
Production:  https://agennext.com
Staging:     https://staging.agennext.com
Development: http://localhost:3000
```

---

## 🏠 Homepage & Main Pages

### Publishing (Reader Interface)
```
GET  /publishing                    # Homepage with featured articles
GET  /publishing/browse             # Browse all articles
GET  /publishing/trending           # Trending articles (last 7 days)
GET  /publishing/search?q=...       # Search results
GET  /publishing/feed               # Personalized feed (logged in)
GET  /publishing/categories         # All categories
GET  /publishing/series             # Article series/collections
GET  /publishing/newsletters        # Newsletter archive
```

### Article Pages
```
GET  /publishing/article/:slug      # Single article reader
GET  /publishing/article/:slug/comments  # Article comments
GET  /publishing/article/:slug/related   # Related articles
GET  /publishing/article/:slug/discussion # Live discussion
```

### Category Pages
```
GET  /publishing/category/:slug              # Category main
GET  /publishing/category/:slug/articles     # Category articles (paginated)
GET  /publishing/category/:slug/trending     # Category trending
GET  /publishing/category/:slug/new          # Category newest
GET  /publishing/category/:slug/subscribe    # Subscribe prompt
```

Examples:
```
/publishing/category/magic-quadrant/articles
/publishing/category/peer-reviews/trending
/publishing/category/analyst-guides/articles?sort=newest&page=2
/publishing/category/technology-radar/subscribe
```

### Author Pages
```
GET  /publishing/author/:username           # Author profile
GET  /publishing/author/:username/articles  # Author's articles
GET  /publishing/author/:username/follow    # Follow author
GET  /publishing/author/:username/about     # Author bio
```

Examples:
```
/publishing/author/john-doe
/publishing/author/john-doe/articles?sort=popular
/publishing/author/jane-smith/about
```

---

## 👤 User Account Pages

### Account & Profile
```
GET  /account                       # Account dashboard
GET  /account/profile              # User profile
GET  /account/edit                 # Edit profile
GET  /account/settings             # Account settings
GET  /account/preferences          # Reader preferences
GET  /account/notifications        # Notification settings
```

### Reading Activity
```
GET  /account/history              # Reading history
GET  /account/reading-list         # Saved articles (bookmarks)
GET  /account/categories           # Subscribed categories
GET  /account/authors              # Followed authors
GET  /account/subscriptions        # Category subscriptions
```

### Subscription & Billing
```
GET  /account/subscribe            # Subscription page
GET  /account/subscription         # Manage subscription
GET  /account/billing              # Billing & invoices
GET  /account/payment-methods      # Saved payment methods
GET  /account/upgrade              # Upgrade to premium
GET  /account/cancel               # Cancel subscription
```

Examples:
```
/account/history?filter=last-30-days
/account/reading-list?sort=date&order=desc
/account/categories?subscribed=true
/account/billing?invoice=INV-2026-001
```

---

## 🔐 Authentication Pages

```
GET  /auth/login                   # Login page
POST /auth/login                   # Login form submission
GET  /auth/signup                  # Signup/registration
POST /auth/signup                  # Register form submission
GET  /auth/forgot-password         # Forgot password
POST /auth/forgot-password         # Send reset email
GET  /auth/reset-password?token=.. # Reset password page
POST /auth/reset-password          # Update password
GET  /auth/verify-email?token=..   # Email verification
GET  /auth/logout                  # Logout
```

---

## 🔍 Search & Discovery

### Search
```
GET  /publishing/search                      # Search page
GET  /publishing/search?q=machine+learning   # Search results
GET  /publishing/search?q=...&category=ai-ml # Category filter
GET  /publishing/search?q=...&author=john    # Author filter
GET  /publishing/search?q=...&type=case-study # Content type filter
GET  /publishing/search?q=...&date=last-month # Date filter
GET  /publishing/search?q=...&sort=relevance  # Sort by relevance
GET  /publishing/search?q=...&page=2         # Pagination
```

Examples:
```
/publishing/search?q=kubernetes
/publishing/search?q=cloud&category=technology
/publishing/search?q=ML&type=research-article&sort=popular
/publishing/search?q=trends&date=last-week&page=2
```

### Advanced Search
```
GET  /publishing/search/advanced             # Advanced search form
GET  /publishing/search/advanced?query=...   # Advanced results
```

---

## 📊 Content Pages

### Article Series/Collections
```
GET  /publishing/series                      # All series
GET  /publishing/series/:slug                # Single series
GET  /publishing/series/:slug/articles       # Series articles (ordered)
GET  /publishing/series/:slug/subscribe      # Subscribe to series
```

Examples:
```
/publishing/series
/publishing/series/cloud-migration-guide
/publishing/series/ai-2026-roadmap/articles
```

### Webinars & Events
```
GET  /publishing/webinars                    # All webinars
GET  /publishing/webinars/:slug              # Single webinar
GET  /publishing/webinars/:slug/register     # Register for webinar
GET  /publishing/webinars/:slug/watch        # Watch recording
```

Examples:
```
/publishing/webinars
/publishing/webinars/kubernetes-101/register
/publishing/webinars/kubernetes-101/watch
```

### Podcasts
```
GET  /publishing/podcasts                    # Podcast list
GET  /publishing/podcasts/:slug              # Podcast series
GET  /publishing/podcasts/:slug/episodes     # Episodes
GET  /publishing/podcasts/:slug/subscribe    # Subscribe (Apple/Spotify)
```

Examples:
```
/publishing/podcasts
/publishing/podcasts/enterprise-insights
/publishing/podcasts/enterprise-insights/episodes
```

---

## 💬 Social & Community

### Comments
```
GET  /publishing/article/:slug/comments           # View comments
POST /publishing/article/:slug/comments           # Add comment
PUT  /publishing/article/:slug/comments/:id       # Edit comment
DELETE /publishing/article/:slug/comments/:id     # Delete comment
POST /publishing/article/:slug/comments/:id/like  # Like comment
POST /publishing/article/:slug/comments/:id/reply # Reply to comment
```

### Social Features
```
GET  /publishing/article/:slug/share              # Share options
POST /publishing/article/:slug/like               # Like article
POST /publishing/article/:slug/bookmark           # Bookmark article
POST /publishing/article/:slug/report             # Report article

POST /publishing/author/:username/follow          # Follow author
POST /publishing/author/:username/unfollow        # Unfollow author
GET  /publishing/author/:username/followers       # Author's followers
GET  /publishing/author/:username/following       # Author following

POST /publishing/category/:slug/subscribe         # Subscribe to category
POST /publishing/category/:slug/unsubscribe       # Unsubscribe
GET  /publishing/category/:slug/subscribers       # Category subscribers

GET  /social/network                              # Social network
GET  /social/followers                            # Your followers
GET  /social/following                            # You're following
GET  /social/recommendations                      # People to follow
```

---

## 📧 Newsletter & Email

```
GET  /publishing/newsletters                      # Newsletter archive
GET  /publishing/newsletters/:slug                # Single newsletter
GET  /publishing/newsletters/:year/:month         # Monthly archive
GET  /account/email-preferences                   # Email settings
POST /account/email-preferences                   # Update preferences
POST /account/unsubscribe?token=...              # Unsubscribe from email
```

Examples:
```
/publishing/newsletters
/publishing/newsletters/weekly-digest
/publishing/newsletters/2026/06
```

---

## 🏆 Leaderboards & Stats

```
GET  /publishing/trending/authors                 # Top authors (by views)
GET  /publishing/trending/articles                # Top articles (by likes)
GET  /publishing/trending/topics                  # Trending topics
GET  /publishing/leaderboard/writers              # Writer leaderboard
GET  /publishing/leaderboard/readers              # Reader engagement
GET  /publishing/awards                           # Featured articles/writers
```

Examples:
```
/publishing/trending/authors?period=month
/publishing/trending/articles?period=week
/publishing/leaderboard/writers?period=year
```

---

## 📱 Mobile & App Links

```
GET  /app                                    # App home
GET  /app/article/:slug                      # Article (mobile optimized)
GET  /app/categories                         # Categories (mobile)
GET  /app/account                            # Account (mobile)

deeplink: creative://article/:slug           # Deep link to article
deeplink: creative://category/:slug          # Deep link to category
deeplink: creative://author/:username        # Deep link to author
```

---

## 🔗 API Endpoints (Backend)

### Articles API
```
GET    /api/v1/publishing/articles                    # List articles (paginated)
GET    /api/v1/publishing/articles/featured           # Featured articles
GET    /api/v1/publishing/articles/trending           # Trending articles
GET    /api/v1/publishing/articles/:id                # Get article
GET    /api/v1/publishing/articles/:slug              # Get by slug
POST   /api/v1/publishing/articles                    # Create article
PUT    /api/v1/publishing/articles/:id                # Update article
DELETE /api/v1/publishing/articles/:id                # Delete article
POST   /api/v1/publishing/articles/:id/like           # Like article
POST   /api/v1/publishing/articles/:id/unlike         # Unlike article
POST   /api/v1/publishing/articles/:id/view           # Record view
POST   /api/v1/publishing/articles/:id/bookmark       # Bookmark
DELETE /api/v1/publishing/articles/:id/bookmark       # Remove bookmark
```

### Comments API
```
GET    /api/v1/publishing/articles/:id/comments              # List comments
POST   /api/v1/publishing/articles/:id/comments              # Create comment
PUT    /api/v1/publishing/comments/:id                       # Edit comment
DELETE /api/v1/publishing/comments/:id                       # Delete comment
POST   /api/v1/publishing/comments/:id/like                  # Like comment
POST   /api/v1/publishing/comments/:id/reply                 # Reply to comment
```

### Categories API
```
GET    /api/v1/publishing/categories                        # List categories
GET    /api/v1/publishing/categories/:slug                  # Get category
GET    /api/v1/publishing/categories/:slug/articles         # Category articles
POST   /api/v1/publishing/categories/:slug/subscribe        # Subscribe
DELETE /api/v1/publishing/categories/:slug/subscribe        # Unsubscribe
```

### Authors API
```
GET    /api/v1/publishing/authors                          # List authors
GET    /api/v1/publishing/authors/:username                # Get author
GET    /api/v1/publishing/authors/:username/articles       # Author articles
POST   /api/v1/publishing/authors/:username/follow         # Follow author
DELETE /api/v1/publishing/authors/:username/follow         # Unfollow author
```

### Feed API
```
GET    /api/v1/publishing/feed                             # Personalized feed
GET    /api/v1/publishing/feed/trending                    # Trending feed
GET    /api/v1/publishing/feed/for-you                     # Recommendations
```

### Search API
```
GET    /api/v1/publishing/search?q=...                     # Full-text search
GET    /api/v1/publishing/search/suggestions?q=...        # Search suggestions
```

### Social API
```
POST   /api/v1/social/users/:id/follow                    # Follow user
DELETE /api/v1/social/users/:id/follow                    # Unfollow user
GET    /api/v1/social/users/:id/followers                 # Get followers
GET    /api/v1/social/users/:id/following                 # Get following
POST   /api/v1/social/articles/:id/share                  # Share article
GET    /api/v1/social/notifications                       # Get notifications
```

---

## 🎯 URL Patterns & Structure

### Slug Format
```
Article:      /publishing/article/machine-learning-guide-2026
Author:       /publishing/author/john-doe
Category:     /publishing/category/ai-ml
Series:       /publishing/series/kubernetes-basics
Webinar:      /publishing/webinars/cloud-native-101
Podcast:      /publishing/podcasts/enterprise-insights
```

### Query Parameters
```
?page=2                    # Pagination
?sort=date|popular|views   # Sorting
?filter=premium            # Filtering
?category=ai-ml            # Category filter
?author=john-doe           # Author filter
?search=keyword            # Search
?date=last-week            # Date range
?type=case-study           # Content type
?view=grid|list            # View mode
```

### URL Examples with Params
```
/publishing/browse?page=2&sort=popular
/publishing/search?q=kubernetes&category=cloud&type=tutorial
/publishing/author/jane-smith/articles?sort=date&page=3
/account/history?filter=last-30-days&sort=date
/publishing/category/technology/articles?sort=newest&page=1
/publishing/trending/authors?period=month&limit=20
```

---

## 🔐 Protected Routes

### Requires Authentication
```
/account/*                           # All account pages
/publishing/article/:slug/comments   # Comment actions
/publishing/article/:slug/like       # Like actions
/publishing/article/:slug/bookmark   # Bookmark
/social/*                            # Social features
```

### Requires Premium Subscription
```
/publishing/article/:slug (if isPremium=true)
/publishing/webinars/:slug/watch (if isPremium=true)
/publishing/podcasts/:slug/episodes (if isPremium=true)
/api/v1/publishing/articles/premium/* # Premium content
```

### Requires Admin
```
/admin/*                             # All admin pages
/api/v1/publishing/articles (POST)   # Create article
/api/v1/publishing/articles/:id (PUT/DELETE) # Edit/delete
/api/v1/publishing/categories/* (admin)      # Manage categories
```

---

## 📊 OpenGraph & Meta Tags

### Article Page Meta
```html
<meta property="og:title" content="Article Title" />
<meta property="og:description" content="Article excerpt..." />
<meta property="og:image" content="https://agennext.com/images/article-slug.jpg" />
<meta property="og:url" content="https://agennext.com/publishing/article/article-slug" />
<meta property="og:type" content="article" />
<meta property="article:author" content="Author Name" />
<meta property="article:published_time" content="2026-06-25T10:00:00Z" />
<meta name="twitter:card" content="summary_large_image" />
```

### Category Page Meta
```html
<meta property="og:title" content="AI & ML Articles" />
<meta property="og:description" content="Explore articles in AI & Machine Learning category" />
<meta property="og:url" content="https://agennext.com/publishing/category/ai-ml" />
<meta property="og:type" content="website" />
```

---

## 📍 Sitemap Routes

```xml
<!-- Homepage and main pages -->
<url><loc>https://agennext.com/publishing</loc></url>
<url><loc>https://agennext.com/publishing/browse</loc></url>
<url><loc>https://agennext.com/publishing/trending</loc></url>

<!-- Dynamic articles -->
<url><loc>https://agennext.com/publishing/article/:slug</loc></url>

<!-- Categories -->
<url><loc>https://agennext.com/publishing/category/:slug</loc></url>

<!-- Authors -->
<url><loc>https://agennext.com/publishing/author/:username</loc></url>

<!-- Series -->
<url><loc>https://agennext.com/publishing/series/:slug</loc></url>
```

---

## 🔗 Internal Navigation Structure

```
Homepage (/publishing)
├─ Browse All
│  ├─ By Category (/publishing/category/:slug)
│  │  ├─ Articles (paginated)
│  │  ├─ Trending
│  │  └─ New
│  ├─ By Author (/publishing/author/:username)
│  ├─ By Series (/publishing/series/:slug)
│  └─ By Type (article, video, podcast, etc)
├─ Trending (/publishing/trending)
│  ├─ This Week
│  ├─ This Month
│  └─ All Time
├─ Search (/publishing/search)
│  ├─ Advanced Search
│  └─ Search Results
└─ My Content (logged in)
   ├─ Feed (/publishing/feed)
   ├─ History (/account/history)
   ├─ Reading List (/account/reading-list)
   ├─ Subscriptions (/account/subscriptions)
   └─ Following (/account/authors)

Article (/publishing/article/:slug)
├─ Comments Section
├─ Related Articles
├─ Author Profile
└─ Share Options

Account (/account)
├─ Profile (/account/profile)
├─ Settings (/account/settings)
├─ Subscription (/account/subscription)
├─ History (/account/history)
└─ Preferences (/account/preferences)
```

---

## 📱 URL Aliases & Redirects

```
/article/:slug       → /publishing/article/:slug
/author/:username    → /publishing/author/:username
/category/:slug      → /publishing/category/:slug
/search              → /publishing/search
/trending            → /publishing/trending
/browse              → /publishing/browse

/subscribe           → /account/subscribe
/profile             → /account/profile
/settings            → /account/settings
/history             → /account/history
```

---

## 🌍 Internationalization (i18n)

```
/en/publishing/article/:slug        # English
/es/publishing/article/:slug        # Spanish
/fr/publishing/article/:slug        # French
/de/publishing/article/:slug        # German
/ja/publishing/article/:slug        # Japanese
/zh/publishing/article/:slug        # Chinese
```

---

## 🚀 Status Codes Reference

```
200 OK                              # Success
201 Created                         # Article/comment created
204 No Content                      # Successful delete
400 Bad Request                     # Invalid input
401 Unauthorized                    # Login required
403 Forbidden                       # No permission
404 Not Found                       # Article/page not found
429 Too Many Requests               # Rate limited
500 Internal Server Error           # Server error
```

---

**Status:** ✅ **COMPLETE URL ROUTING STRUCTURE**

All paths documented and ready to implement! 🌐
