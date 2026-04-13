terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Retrieve current Azure context (for Key Vault access policy)
data "azurerm_client_config" "current" {}

# ------------------------------------------------------------
# Resource Group (Free)
# ------------------------------------------------------------
resource "azurerm_resource_group" "rg" {
  name     = "smartfood-rg"
  location = "North Europe"
}

# ------------------------------------------------------------
# Azure Blob Storage – Free Tier (5 GB LRS for 12 months)
# ------------------------------------------------------------
resource "azurerm_storage_account" "storage" {
  name                     = "smartfoodstorageshahn"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "LRS"   # Locally redundant, free tier

  # Optional: Enable hierarchical namespace for Data Lake (costs extra)
  is_hns_enabled = false
}

resource "azurerm_storage_container" "images" {
  name                  = "bag-images"
  storage_account_name  = azurerm_storage_account.storage.name
  container_access_type = "private"
}

# ------------------------------------------------------------
# Azure Key Vault – Free Tier (10,000 operations/month)
# ------------------------------------------------------------
resource "azurerm_key_vault" "kv" {
  name                = "smartfood-kv-khanshahn"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"   # No "free" SKU, but very low cost; free tier applies automatically

  # Allow current user to manage secrets
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Get", "List", "Set", "Delete", "Backup", "Restore", "Recover", "Purge"
    ]
  }
}

# ------------------------------------------------------------
# OUTPUTS – Useful for connection strings
# ------------------------------------------------------------
output "resource_group_name" {
  value = azurerm_resource_group.rg.name
}

output "storage_account_name" {
  value = azurerm_storage_account.storage.name
}

output "storage_container_name" {
  value = azurerm_storage_container.images.name
}

output "key_vault_uri" {
  value = azurerm_key_vault.kv.vault_uri
}