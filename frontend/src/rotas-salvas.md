# Rotas do App (AppRouter)

```
<Route path="/" element={<App />} />
<Route path="/login" element={<Login onLogin={handleLogin} />} />
<Route path="/register" element={<Register />} />
<Route path="/privacidade" element={<Privacidade />} />
<Route path="/cookies" element={<Cookies />} />
<Route path="/complete-profile" element={<CompleteProfile token={token || ''} />} />
<Route path="/admin/*" element={
  <React.Suspense fallback={<div>Carregando...</div>}>
    <AdminDashboard />
  </React.Suspense>
} />
<Route path="*" element={<Navigate to="/" />} />
```

- O botão "Meus Pedidos" usa a rota: `/pedidos`
- O botão "Cardápio" abre modal, não rota.
