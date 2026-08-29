// Mock authentication module (temporary)
// - Stores a simple token in localStorage under 'admin_session'
// - Replace AdminAuth.* methods to integrate with real backend later

window.AdminAuth = (function(){
  const KEY = 'admin_session_v1';

  function isAuthenticated(){
    try{ return !!localStorage.getItem(KEY); }catch(e){ return false; }
  }

  async function login({username, password, remember}){
    // Temporary policy: require non-empty username and password
    if (!username) return { success:false, message: 'الرجاء إدخال اسم المستخدم أو البريد.' };
    if (!password) return { success:false, message: 'الرجاء إدخال كلمة المرور.' };

    // Mock: accept any non-empty credentials (no real password stored)
    const token = btoa(JSON.stringify({user: username, ts: Date.now()}));
    try{
      if (remember) localStorage.setItem(KEY, token);
      else sessionStorage.setItem(KEY, token);
    }catch(e){ console.warn('storage failed', e); }

    return { success:true };
  }

  function logout(){
    try{ localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); }catch(e){}
    // redirect to login
    window.location.href = '/admin/login.html';
  }

  return { isAuthenticated, login, logout };
})();
