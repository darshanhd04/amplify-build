-- ====================================================================
-- AMPLIFY: Campaign Amplification Platform - Initial Relational Schema
-- ====================================================================

-- 1. Profiles Table (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    handle TEXT UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'creator',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    title VARCHAR(60) NOT NULL,
    category VARCHAR(50) NOT NULL,
    summary TEXT NOT NULL,
    cover_image_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    funding_goal NUMERIC(12, 2) NOT NULL CHECK (funding_goal >= 1000),
    amount_raised NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (amount_raised >= 0),
    backers_count INTEGER NOT NULL DEFAULT 0 CHECK (backers_count >= 0),
    headline TEXT NOT NULL,
    introduction TEXT,
    deadline TIMESTAMPTZ,
    agreed_to_policies BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (
        status IN (
            'draft', 'submitted_for_review', 'changes_requested', 'approved',
            'rejected', 'available_for_funding', 'funding_goal_reached',
            'funding_period_ended', 'distribution_preparation', 'promoting',
            'completed', 'cancelled', 'refund_pending', 'failed'
        )
    )
);

-- 3. Campaign Narrative Sections
CREATE TABLE IF NOT EXISTS public.campaign_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    section_order INTEGER NOT NULL,
    section_type VARCHAR(20) DEFAULT 'text',
    title TEXT,
    content TEXT,
    stat_number TEXT,
    stat_label TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Visible Supporting Sources (Mandatory Fact-Checking Evidence)
CREATE TABLE IF NOT EXISTS public.campaign_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Campaign Ad Creatives
CREATE TABLE IF NOT EXISTS public.campaign_creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    ad_headline VARCHAR(70) NOT NULL,
    ad_description TEXT NOT NULL,
    cta_text VARCHAR(40) NOT NULL,
    media_url TEXT,
    placement_type VARCHAR(30) DEFAULT 'feed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Campaign Targeting & Reach Settings
CREATE TABLE IF NOT EXISTS public.campaign_targeting (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    target_geography TEXT NOT NULL,
    target_audience TEXT,
    duration_days INTEGER NOT NULL CHECK (duration_days BETWEEN 3 AND 90),
    channels TEXT[] NOT NULL,
    estimated_reach_rate NUMERIC(6, 2) DEFAULT 15.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Backer Contributions (Financial Records)
CREATE TABLE IF NOT EXISTS public.contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id VARCHAR(30) UNIQUE NOT NULL,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE RESTRICT,
    backer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    backer_name TEXT DEFAULT 'Anonymous Backer',
    backer_email TEXT,
    gross_amount NUMERIC(10, 2) NOT NULL CHECK (gross_amount > 0),
    platform_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    payment_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    net_ad_budget NUMERIC(10, 2) NOT NULL DEFAULT 0,
    estimated_incremental_reach INTEGER NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'successful',
    is_anonymous BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Audited Distribution Reports
CREATE TABLE IF NOT EXISTS public.distribution_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE RESTRICT,
    gross_funding NUMERIC(12, 2) NOT NULL,
    platform_fee NUMERIC(12, 2) NOT NULL,
    payment_fees NUMERIC(12, 2) NOT NULL,
    net_ad_spend NUMERIC(12, 2) NOT NULL,
    estimated_reach INTEGER NOT NULL,
    measured_impressions INTEGER NOT NULL,
    verified_reach INTEGER NOT NULL,
    clicks INTEGER NOT NULL,
    avg_cpm NUMERIC(8, 2) NOT NULL,
    channel_performance JSONB NOT NULL DEFAULT '[]'::jsonb,
    top_regions TEXT[] NOT NULL DEFAULT '{}',
    is_simulated_audit BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    type VARCHAR(40) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Saved Bookmarks
CREATE TABLE IF NOT EXISTS public.saved_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, campaign_id)
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribution_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_campaigns ENABLE ROW LEVEL SECURITY;

-- Public can view active campaigns
CREATE POLICY "Public read active campaigns" ON public.campaigns
    FOR SELECT USING (status NOT IN ('draft', 'rejected'));

-- Creators can view and edit their own drafts
CREATE POLICY "Creators manage own campaigns" ON public.campaigns
    FOR ALL USING (auth.uid() = creator_id);

-- Public can view visible sources
CREATE POLICY "Public read sources" ON public.campaign_sources
    FOR SELECT USING (true);

-- Contributions private to backer and campaign creator
CREATE POLICY "Users read own contributions" ON public.contributions
    FOR SELECT USING (auth.uid() = backer_id);

-- Distribution reports public
CREATE POLICY "Public read distribution reports" ON public.distribution_reports
    FOR SELECT USING (true);

-- Notifications private to recipient
CREATE POLICY "Users read own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);
