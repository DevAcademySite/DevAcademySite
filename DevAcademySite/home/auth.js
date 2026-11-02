// A sessão é verificada pelo servidor; não guardamos senhas no navegador.
window.DevAcademy = (() => {
  async function api(path, data) {
    const response = await fetch(path, data === undefined ? {credentials:'same-origin'} : {
      method:'POST', credentials:'same-origin', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)
    });
    const result = await response.json().catch(() => { throw new Error('Inicie o projeto com py server.py e abra http://127.0.0.1:8000.'); });
    if (!response.ok) throw new Error(result.error || 'Não foi possível concluir. Tente novamente.');
    return result;
  }
  const ready = api('/api/session').then(({user}) => {
    if (document.documentElement.hasAttribute('data-protected')) {
      if (!user) {
        const target = location.pathname.includes('profile') ? 'profile' : 'quiz';
        location.replace('../home/home.html?next='+target+'#login');
        return null;
      }
      document.body.style.visibility='visible';
    }
    document.querySelectorAll('[data-guest]').forEach(el => el.hidden=!!user);
    document.querySelectorAll('[data-member], [data-logout]').forEach(el => el.hidden=!user);
    return user;
  }).catch(error => {
    if (document.documentElement.hasAttribute('data-protected')) {
      document.body.replaceChildren();
      const p=document.createElement('p'); p.textContent=error.message;document.body.append(p);document.body.style.visibility='visible';
    }
    return null;
  });
  document.querySelectorAll('[data-logout]').forEach(button => button.addEventListener('click', async () => {
    button.disabled=true;
    try { await api('/api/logout',{});location.replace('../home/home.html#login'); }
    catch(error) { button.disabled=false;alert(error.message); }
  }));
  // Ao voltar pelo histórico, consulte novamente a sessão no servidor.
  window.addEventListener('pageshow',event => { if(event.persisted) location.reload(); });
  return {api,ready};
})();
