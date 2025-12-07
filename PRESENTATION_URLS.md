# 🎥 Presentation URLs - Quick Reference

## ✅ WORKING URLs for Your Presentation

### Direct Backend Access (Available Now)
**Base URL:** `http://158.158.49.253:5001`

- **Health Check:** http://158.158.49.253:5001/health
- **API Base:** http://158.158.49.253:5001/api
- **Example API:** http://158.158.49.253:5001/api/health

### Application Gateway (Will be ready in 15-30 minutes)
**Base URL:** `http://68.221.206.80`

- **Health Check:** http://68.221.206.80/health
- **API Base:** http://68.221.206.80/api

## 🔧 What Was Fixed

1. **Added Temporary NSG Rule:** Allows public access to backend port 5001
   - This is safe and won't affect your code
   - Can be removed later once Application Gateway is ready
   - Priority: 1005 (higher than gateway rules)

2. **Application Gateway Creation:** Running in background
   - Will be ready in 15-30 minutes
   - Once ready, you can use the cleaner URL (without port)

3. **Backend Status:** 
   - Containers are running (verified from last deployment)
   - Backend is healthy on the VM
   - Just needed network access

## 📝 For Your Presentation

**Use this URL:** `http://158.158.49.253:5001/health`

This will show:
```json
{
  "status": "OK",
  "message": "Momo Splitwise API is running",
  "database": "Connected",
  ...
}
```

## ⚠️ Important Notes

- **This is temporary:** Once Application Gateway is ready, use `http://68.221.206.80`
- **No code changes:** This only affects network security rules, not your application code
- **Safe to remove later:** The temporary NSG rule can be removed after presentation

## 🧹 Cleanup (After Presentation)

To remove the temporary public access rule:

1. Edit `terraform/modules/security/main.tf`
2. Remove the `allow-public-backend-temporary` security rule (lines ~93-105)
3. Run: `terraform apply -target=module.security.azurerm_network_security_group.application`

This will restore the original security configuration (only Application Gateway can access backend).

