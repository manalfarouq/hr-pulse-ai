# Remplace hrpulse-language par ai-language-hr-pulse
data "azurerm_cognitive_account" "language" {
  name                = "ai-language-hr-pulse"
  resource_group_name = var.resource_group_name
}