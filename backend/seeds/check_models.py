import re, os
f = open(os.path.join(os.path.dirname(__file__), "..", "app", "models", "legacy_s9.py"), encoding="utf-8").read()
targets = ["szhdrs", "szcatdtls", "terminalmaster", "browsesettings", "catalogsettings",
           "agencycathdr", "agencycatdtl", "confinschemedtls", "additionalchargedtls",
           "printnodetrnconfigmaster", "printtemplateconfigdtls", "transactioncomponentsdtls"]
for t in targets:
    pattern = r"__tablename__\s*=\s*'" + t + r"'"
    found = bool(re.search(pattern, f, re.IGNORECASE))
    print("  {:40s} {}".format(t, "FOUND" if found else "MISSING <-- need SQLAlchemy model"))
