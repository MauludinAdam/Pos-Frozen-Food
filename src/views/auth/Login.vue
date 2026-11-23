<script setup>
import image from '@/assets/images/pos.jpg'
import Swal from 'sweetalert2';
import { onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/services/AuthApi';

const router = useRouter()

const showPass = ref(false);

const form = ref({
    email: "",
    password: ""
});

const message = ref("");
const successMessage = ref("");
const loading = ref(false);
const errors = ref({});

const rateLimitSeconds = ref(0);
let rateLimitTimer = null;

const logoutMessage = localStorage.getItem("logoutMessage");

if (logoutMessage) {
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Anda berhasil logout',
        showConfirmButton: false,
        timer: 3000
    });

    localStorage.removeItem("logoutMessage");
}

const startRateLimitCountdown = (seconds) => {
    rateLimitSeconds.value = seconds;

    if (rateLimitTimer) {
        clearInterval(rateLimitTimer);
    }

    rateLimitTimer = setInterval(() => {
        if (rateLimitSeconds.value > 0) {
            rateLimitSeconds.value--;
        }

        if (rateLimitSeconds.value <= 0) {
            clearInterval(rateLimitTimer);
            rateLimitTimer = null;
        }
    }, 1000)
}

onBeforeUnmount(() => {
    if (rateLimitTimer) {
        clearInterval(rateLimitTimer);
    }
});

const submitLogin = async () => {
    loading.value = true;
    message.value = "";
    errors.value = {};

    if (!form.value.email) {
        errors.value.email = ["Email harus diisi"];
    }

    if (form.value.email && !form.value.email.includes("@")) {
        errors.value.email = ["Format email tidak valid"];
    }

    if (!form.value.password) {
        errors.value.password = ["Password harus diisi"];
    }

    if (form.value.password && form.value.password.length < 8) {
        errors.value.password = ["Password minimal 8 - 12 karakter"];
    }

    // jika ada error, stop proses login
    if (Object.keys(errors.value).length > 0) {
        loading.value = false;

        return;
    }

    try {
        const response = await login(form.value);

        // console.log('LOGIN RESPON:', response.data)

        console.log(response.data);
        console.log(response.data.user);

        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.data));

        localStorage.setItem("logoutMessage", "Anda berhasil logout");

        const user = response.data.data.data

        const role = user.role?.name

        if (role === "Super Admin") {
            await router.push({ name: 'dashboard' });

        } else if (role === "Admin") {
            await router.push({ name: 'dashboard' })

        } else if (role === "Kasir") {
            await router.push({ name: 'transaction' })

        } else {
            console.log(role)

            Swal.fire({
                icon: 'error',
                title: 'Role tidak dikenali',
                text: `Role "${role}" tidak memiliki dashboard.`,
            })
        }
    } catch (error) {
        if (error.response) {
            const status = error.response.status;

            if (status === 400 || status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Gagal',
                    text: 'Email atau password salah.',
                    confirmButtonText: "Coba lagi"
                })

            } else if (status === 422) {
                message.value = error.response.data.message || "Data login tidak valid";
            } else if (status === 429) {
                message.value = error.response.data.message || "Terlalu banyak percobaan login";

                const match = message.value.match(/(\d+)\s*detik/i);

                if (match) {
                    startRateLimitCountdown(Number(match[1]));
                }
            } else if (status === 404) {

                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: 'Endpoint login tidak ditemukan.',
                    confirmButtonText: 'Coba lagi',
                });

            } else if (status === 500) {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: 'Terjadi kesalahan pada server. Silahkan coba lagi nanti.',
                    confirmButtonText: 'Coba lagi',
                })

            } else {
                message.value = error.response.data.message || "Terjadi kesalahan saat login.";
            }

        } else if (error.request) {

            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: 'Tidak dapat terhubung ke server. Periksa kembali koneksi internet anda.',
                confirmButtonText: 'Coba lagi',
            })
        } else {
            message.value = error.message || "Terjadi kesalahan.";
        }
    } finally {
        loading.value = false;
    }
}

</script>

<template>
    <div class="body-login">
        <div class="d-flex align-items-center justify-content-center">
            <div class="card card-login" style="width: 50rem;">
                <div class="row">
                    <div class="col-md-6">
                        <img :src="image" alt="images" height="430" width="400">
                    </div>
                    <div class="col-md-6">
                        <div class="title text-center mt-5">
                            <h3>Aplikasi Inventory</h3>
                            <h5>& Point Of Sales (Frozen Food)</h5>
                        </div>

                        <div v-if="successMessage" class="alert bg-success text-white">
                            <i class="fas fa-check-circle"></i> {{ successMessage }}
                        </div>

                        <div v-if="message" class="alert bg-danger text-white">
                            <i class="fas fa-exlamation-triangle">{{ message }}</i>
                        </div>
                        <form @submit.prevent="submitLogin" class="mt-2 p-4">
                            <div class="mb-3">
                                <label for="exampleInputEmail1" class="form-label">Email</label>
                                <input type="email" v-model="form.email" class="form-control"
                                    :class="{ 'is-invalid': errors.email }" placeholder="Masukkan Email">
                                <small class="invalid-feedback">{{ errors.email?.[0] }}</small>
                            </div>
                            <div class="mb-3">
                                <label for="exampleInputPassword1" class="form-label">Password</label>
                                <input :type="showPass ? 'text' : 'password'" v-model="form.password"
                                    class="form-control" :class="{ 'is-invalid': errors.password }"
                                    placeholder="masukkan Password">
                                <small class="invalid-feedback">{{ errors.password?.[0] }}</small>
                            </div>
                            <div class="mb-3 d-flex align-items-center justify-content-between">
                                <div class="form-check">
                                    <input type="checkbox" v-model="showPass" class="form-check-input"
                                        id="exampleCheck1">
                                    <label class="form-check-label" for="exampleCheck1">Show Password</label>
                                </div>
                                <div class="forget-pass">
                                    <a href="" class="text-decoration-underline">forgot password</a>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary w-100"
                                :disabled="loading || rateLimitSeconds > 0"><i class="fas fa-sign-in"></i>
                                {{ loading ? "Loading..." : rateLimitSeconds > 0 ? `tunggu ${rateLimitSeconds} detik...`
                                    :
                                    "Login" }}</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.body-login {
    background-color: rgb(70, 70, 224);
    min-height: 100vh;
}

.card-login {
    margin-top: 8rem;
}
</style>