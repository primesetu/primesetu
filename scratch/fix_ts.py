
import re
import os

fixes = {
    'src/components/CommandBar.tsx': [
        (r"import React, { useState, useEffect } from 'react';", r"import { useState, useEffect } from 'react';")
    ],
    'src/modules/analytics/AttributeSales.tsx': [
        (r"const \[loading, setLoading\] = useState\(false\)", r"// const [loading, setLoading] = useState(false)")
    ],
    'src/modules/billing/TransactionsModule.tsx': [
        (r"import React, { useState } from 'react'", r"import { useState } from 'react'"),
        (r"Search, Filter, Download, ChevronRight, CheckCircle2, X, RotateCcw, User", r"Search, Filter, Download, CheckCircle2, RotateCcw")
    ],
    'src/modules/catalogue/MasterRegistry.tsx': [
        (r"Search, Plus, Package, Tag, Hash, Box, Filter, Download, CalendarDays", r"Search, Plus, Package, Tag, Box, Filter, Download"),
        (r"const \[loading, setLoading\] = useState\(true\)", r"// const [loading, setLoading] = useState(true)")
    ],
    'src/modules/dashboard/ManagementDashboard.tsx': [
        (r"import React, { useState, useEffect } from 'react'", r"import { useState, useEffect } from 'react'")
    ],
    'src/modules/ho/HOSyncModule.tsx': [
        (r"import React, { useState, useEffect } from 'react'", r"import { useState, useEffect } from 'react'"),
        (r"import { motion, AnimatePresence } from 'framer-motion'", r"import { AnimatePresence } from 'framer-motion'"),
        (r"CloudSync, Globe, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Database, Server", r"CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Database, Server"),
        (r"setLogs\(prev => ", r"setLogs((prev: any) => ")
    ],
    'src/modules/inventory/BarcodeStudio.tsx': [
        (r"import React, { useState } from 'react'", r"import { useState } from 'react'"),
        (r"Printer, Settings, ScanBarcode, Tag, Layout, Download", r"Printer, Settings, ScanBarcode, Download")
    ],
    'src/modules/inventory/BulkItemMaster.tsx': [
        (r"import { motion, AnimatePresence } from 'framer-motion'", r"import { motion } from 'framer-motion'"),
        (r"Upload, Download, FileSpreadsheet, CheckCircle2, AlertTriangle, Save", r"Upload, Download, FileSpreadsheet, CheckCircle2, AlertTriangle")
    ],
    'src/modules/inventory/InventoryModule.tsx': [
        (r"import React, { useState, useEffect } from 'react'", r"import { useState, useEffect } from 'react'"),
        (r"const \[loading, setLoading\] = useState\(true\)", r"// const [loading, setLoading] = useState(true)")
    ],
    'src/modules/inventory/InwardingModule.tsx': [
        (r"import React, { useState } from 'react'", r"import { useState } from 'react'"),
        (r"import { motion, AnimatePresence } from 'framer-motion'", r"import { motion } from 'framer-motion'"),
        (r"PackageOpen, Truck, CheckCircle2, Plus, Printer, Save, Search", r"PackageOpen, CheckCircle2, Plus, Save"),
        (r"const \[vendor, setVendor\] = useState\(''\)", r"// const [vendor, setVendor] = useState('')"),
        (r"const \[docNo, setDocNo\] = useState\(''\)", r"// const [docNo, setDocNo] = useState('')")
    ],
    'src/modules/inventory/PhysicalStockModule.tsx': [
        (r"import React, { useState } from 'react'", r"import { useState } from 'react'"),
        (r"ClipboardList, CheckCircle2, AlertTriangle, Scan, Search, Filter, Save, Trash2", r"ClipboardList, CheckCircle2, AlertTriangle, Scan, Search, Filter, Save")
    ],
    'src/modules/inventory/ProcurementModule.tsx': [
        (r"import React, { useState } from 'react'", r"import { useState } from 'react'"),
        (r"ShoppingCart, Plus, Filter, Download, Building2, Calendar, Search", r"ShoppingCart, Plus, Filter, Download, Building2, Calendar")
    ]
}

for file_path, replacements in fixes.items():
    full_path = os.path.join('frontend', file_path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        for old, new in replacements:
            content = re.sub(old, new, content)
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {file_path}")
    else:
        print(f"Not found: {file_path}")
