
const base = 'http://localhost:5000';
const socket = io(base);

new Vue({
  el: '#app',
  data: {
    base,
    page: 'welcome',
    authTab: 'login',
    auth: { name: '', email: '', password: '', role: 'student' },
    user: null,
    profilePhotoPreview: '',
    files: {},
    // student
    studentTab: 'profile',
    studentProfile: { name: '', email: '', dob: '', gender: '', college: '' },
    jobs: [],
    applications: [],
    // recruiter
    recruiterTab: 'profile',
    recruiterProfile: { name: '', email: '', company: '' },
    newJob: { title: '', country: '', workMode: '', salary: '', jd: '' },
    recruiterApplications: []
  },
  created() {
    const saved = localStorage.getItem('user');
    if (saved) {
      this.user = JSON.parse(saved);
      this.page = this.user.role === 'student' ? 'student' : 'recruiter';
      this.fetchInitial();
    }
    socket.on('statusUpdated', data => {
      this.fetchInitial();
    });
    this.fetchJobs();
  },
  methods: {
    async submitAuth() {
      try {
        if (this.authTab === 'register') {
          const res = await this.$api.post('/auth/register', {
            name: this.auth.name, email: this.auth.email, password: this.auth.password, role: this.auth.role
          });
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          this.user = res.data.user;
        } else {
          const res = await this.$api.post('/auth/login', { email: this.auth.email, password: this.auth.password });
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          this.user = res.data.user;
        }
        this.page = this.user.role === 'student' ? 'student' : 'recruiter';
        this.fetchInitial();
      } catch (e) {
        alert(e.response && e.response.data ? e.response.data.message : 'Auth error');
      }
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.user = null;
      this.page = 'welcome';
    },
    onFileChange(e, field) {
      const file = e.target.files[0];
      if (!file) return;
      this.files[field] = file;
      if (field === 'photo') {
        const reader = new FileReader();
        reader.onload = ev => { this.profilePhotoPreview = ev.target.result; };
        reader.readAsDataURL(file);
      }
    },
    async uploadPhoto() {
      try {
        if (!this.files.photo) return alert('Choose a photo');
        const form = new FormData();
        form.append('photo', this.files.photo);
        const res = await this.$api.post('/uploads/profile-photo', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        this.user.profilePhoto = res.data.url;
        localStorage.setItem('user', JSON.stringify(this.user));
        this.profilePhotoPreview = '';
        alert('Photo uploaded');
        this.fetchInitial();
      } catch (e) {
        console.error(e);
        alert('Upload failed');
      }
    },
    async uploadDocs() {
      try {
        const form = new FormData();
        ['doc10','doc12','ug','pg','resume'].forEach(k => { if (this.files[k]) form.append(k, this.files[k]); });
        const res = await this.$api.post('/uploads/student-docs', form, { headers: { 'Content-Type': 'multipart/form-data' } });
        alert('Documents uploaded');
        this.fetchInitial();
      } catch (e) { console.error(e); alert('Upload failed'); }
    },
    async fetchJobs() {
      try { const res = await this.$api.get('/jobs'); this.jobs = res.data; } catch (e) { console.error(e); }
    },
    async apply(job) {
      try { await this.$api.post('/applications', { jobId: job._id }); alert('Applied'); this.fetchInitial(); } catch (e) { console.error(e); alert('Error'); }
    },
    async postJob() {
      try { await this.$api.post('/jobs', this.newJob); alert('Job posted'); this.newJob = { title:'',country:'',workMode:'',salary:'',jd:'' }; this.fetchJobs(); } catch (e) { console.error(e); alert('Error'); }
    },
    async fetchInitial() {
      if (!this.user) return;
      try {
        if (this.user.role === 'student') {
          const res = await this.$api.get('/applications/my'); this.applications = res.data;
          const me = await this.$api.get('/auth/me'); if (me.data && me.data.user) { this.user = me.data.user; localStorage.setItem('user', JSON.stringify(this.user)); }
        } else {
          const res = await this.$api.get('/applications/recruiter'); this.recruiterApplications = res.data;
          const me = await this.$api.get('/auth/me'); if (me.data && me.data.user) { this.user = me.data.user; localStorage.setItem('user', JSON.stringify(this.user)); }
        }
        this.fetchJobs();
      } catch (e) { console.error(e); }
    },
    async updateStatus(app, status) {
      try { const res = await this.$api.patch('/applications/' + app._id + '/status', { status }); alert('Status updated'); socket.emit('statusUpdate', { applicationId: app._id, status }); this.fetchInitial(); } catch (e) { console.error(e); alert('Error'); }
    }
  }
});
