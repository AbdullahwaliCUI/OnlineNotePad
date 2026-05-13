-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    company TEXT,
    notes TEXT,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own contacts" 
    ON contacts FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts" 
    ON contacts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts" 
    ON contacts FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts" 
    ON contacts FOR DELETE 
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
