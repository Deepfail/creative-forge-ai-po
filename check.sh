#!/bin/bash
# Simple syntax check
cd /workspaces/spark-template
npx tsc --noEmit --skipLibCheck
echo "TypeScript check complete"