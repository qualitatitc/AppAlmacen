-- Create Users table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'operador',
    status TEXT DEFAULT 'active',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMP WITH TIME ZONE
);

-- Create Products table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT,
    unit TEXT DEFAULT 'uds',
    weight NUMERIC DEFAULT 0,
    "minStock" INTEGER DEFAULT 0,
    "inventario" INTEGER DEFAULT 0,
    "lotRequired" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMP WITH TIME ZONE
);

-- Create Locations table
CREATE TABLE IF NOT EXISTS public.locations (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT,
    level TEXT DEFAULT 'position',
    type TEXT DEFAULT 'almacenaje',
    "parentId" TEXT REFERENCES public.locations(id),
    status TEXT DEFAULT 'active',
    "maxCapacity" INTEGER DEFAULT 1,
    rows INTEGER DEFAULT 1,
    "slotsPerRow" INTEGER DEFAULT 3,
    x_pos NUMERIC,
    z_pos NUMERIC,
    rotation NUMERIC,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMP WITH TIME ZONE
);

-- Create Inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
    id TEXT PRIMARY KEY,
    "productId" TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    "locationId" TEXT REFERENCES public.locations(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 0,
    lot TEXT,
    "entryDate" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    col TEXT,
    row TEXT,
    pos TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMP WITH TIME ZONE
);

-- Create Movements table
CREATE TABLE IF NOT EXISTS public.movements (
    id TEXT PRIMARY KEY,
    "productId" TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    type TEXT, -- 'entrada', 'salida', 'traslado', etc.
    quantity INTEGER,
    lot TEXT,
    "locationId" TEXT REFERENCES public.locations(id),
    "userId" TEXT REFERENCES public.users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMP WITH TIME ZONE
);

-- Note: We disable RLS for these tables to allow the app to work without complex policies for now
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements DISABLE ROW LEVEL SECURITY;
