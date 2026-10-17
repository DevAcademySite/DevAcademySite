DevAcademy.ready.then(user=>{
  if(!user)return;
  const form=document.querySelector('#profile-form'), status=document.querySelector('#profile-status');
  for(const field of form.elements)if(field.name && user[field.name]!==undefined)field.value=user[field.name];
  form.addEventListener('submit',async event=>{
    event.preventDefault();const button=form.querySelector('button');button.disabled=true;
    try {await DevAcademy.api('/api/profile',Object.fromEntries(new FormData(form)));status.textContent='Seus dados foram salvos.';}
    catch(error){status.textContent=error.message;}
    finally{button.disabled=false;}
  });
});
