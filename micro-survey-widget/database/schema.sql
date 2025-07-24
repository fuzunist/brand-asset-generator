-- Create ENUM types
CREATE TYPE survey_type AS ENUM ('poll', 'rating');
CREATE TYPE survey_status AS ENUM ('active', 'inactive');

-- Create surveys table
CREATE TABLE surveys (
    id VARCHAR(21) PRIMARY KEY, -- NanoID format
    brand_identity_id UUID NOT NULL,
    question TEXT NOT NULL,
    type survey_type NOT NULL,
    options JSONB NOT NULL,
    status survey_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create survey_responses table
CREATE TABLE survey_responses (
    id SERIAL PRIMARY KEY,
    survey_id VARCHAR(21) NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    response_value VARCHAR(255) NOT NULL,
    ip_address_hash VARCHAR(64) NOT NULL, -- SHA256 hash of IP address
    user_agent VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_surveys_brand_identity ON surveys(brand_identity_id);
CREATE INDEX idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX idx_survey_responses_created_at ON survey_responses(created_at);
CREATE INDEX idx_survey_responses_ip_hash ON survey_responses(ip_address_hash);

-- Create a view for survey results aggregation
CREATE VIEW survey_results AS
SELECT 
    s.id as survey_id,
    s.question,
    s.type,
    s.options,
    COUNT(sr.id) as total_responses,
    json_agg(
        json_build_object(
            'value', sr.response_value,
            'count', COUNT(sr.response_value)
        ) ORDER BY sr.response_value
    ) as response_distribution
FROM surveys s
LEFT JOIN survey_responses sr ON s.id = sr.survey_id
GROUP BY s.id, s.question, s.type, s.options;