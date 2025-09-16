# Script PowerShell para consultar pedidos autenticados
# Salve seu token JWT no arquivo token.txt antes de rodar

$token = Get-Content .\token.txt
curl -H "Authorization: Bearer $token" http://127.0.0.1:8000/pedidos/
