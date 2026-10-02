const profileForm = document.querySelector('#profile-form');
const profileStatus = document.querySelector('#profile-status');
const profileStorageKey = 'devAcademyProfile';

if (profileForm && profileStatus) {
    try {
        const savedProfile = JSON.parse(localStorage.getItem(profileStorageKey) || '{}');

        if (savedProfile && typeof savedProfile === 'object' && !Array.isArray(savedProfile)) {
            for (const field of profileForm.elements) {
                if (field.name && typeof savedProfile[field.name] === 'string') {
                    field.value = savedProfile[field.name];
                }
            }
        }
    } catch (error) {
        console.error('Não foi possível carregar os dados do perfil.', error);
        profileStatus.textContent = 'Não foi possível carregar os dados salvos.';
    }

    profileForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const profile = Object.fromEntries(new FormData(profileForm).entries());

        try {
            localStorage.setItem(profileStorageKey, JSON.stringify(profile));
            profileStatus.textContent = 'Seus dados foram salvos.';
        } catch (error) {
            console.error('Não foi possível salvar os dados do perfil.', error);
            profileStatus.textContent = 'Não foi possível salvar seus dados. Tente novamente.';
        }
    });
}
