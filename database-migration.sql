-- Database Migration: Add missing product columns
-- Execute this in Supabase SQL Editor

-- Add power consumption columns for cooling and heating (if they don't exist)
DO $$ 
BEGIN
    -- Add power_consumption_cooling column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'power_consumption_cooling'
    ) THEN
        ALTER TABLE public.products 
        ADD COLUMN power_consumption_cooling VARCHAR;
        
        -- Copy data from electricity_cooling_kw if it exists
        UPDATE public.products 
        SET power_consumption_cooling = CAST(electricity_cooling_kw AS VARCHAR)
        WHERE electricity_cooling_kw IS NOT NULL;
    END IF;

    -- Add power_consumption_heating column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'power_consumption_heating'
    ) THEN
        ALTER TABLE public.products 
        ADD COLUMN power_consumption_heating VARCHAR;
        
        -- Copy data from electricity_heating_kw if it exists
        UPDATE public.products 
        SET power_consumption_heating = CAST(electricity_heating_kw AS VARCHAR)
        WHERE electricity_heating_kw IS NOT NULL;
    END IF;

    -- Change capacity_btu to VARCHAR if it's still integer/numeric (allows text like "12000 BTU")
    -- First check current type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'capacity_btu'
        AND data_type IN ('integer', 'bigint', 'numeric')
    ) THEN
        -- Convert to VARCHAR
        ALTER TABLE public.products 
        ALTER COLUMN capacity_btu TYPE VARCHAR USING capacity_btu::VARCHAR;
    END IF;

    -- Ensure noise_level is VARCHAR (for text input like "19-23 dB")
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'noise_level'
        AND data_type IN ('integer', 'bigint', 'numeric')
    ) THEN
        ALTER TABLE public.products 
        ALTER COLUMN noise_level TYPE VARCHAR USING noise_level::VARCHAR;
    END IF;
END $$;

-- Verify the columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN (
    'power_consumption_cooling',
    'power_consumption_heating',
    'capacity_btu',
    'noise_level'
)
ORDER BY column_name;
