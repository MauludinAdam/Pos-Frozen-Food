<script setup>
import { createSatuans, deleteSatuans, getSatuans, updateSatuans } from '@/services/SatuanApi';
import { toast } from '@/utils/Swal';
import Swal from 'sweetalert2';
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const loading = ref(false);
const message = ref("");
const errors = ref({});

const satuans = ref([]);

const search = ref('');

// pagination
const currentPage = ref(1)
const perPage = ref(10)
const lastPage = ref(1)
const totalData = ref(0)

const getData = async () => {
    try {
        loading.value = true;
        errors.value = {};
        message.value = "";

        const response = await getSatuans({
            page: currentPage.value,
            row_per_page: perPage.value,
            search: search.value || null,
        })

        console.log(response.data);

        satuans.value = response.data.data.data;

        currentPage.value = response.data.data.meta.current_page;
        lastPage.value = response.data.data.meta.last_page;
        totalData.value = response.data.data.meta.total;
    } catch (error) {
        console.log(error);
    } finally {
        loading.value = false;
    }
}

const changePage = (page) => {
    if (page < 1 || page > lastPage.value) {
        return;
    }

    currentPage.value = page;

    getData();
}

let timeout = null;
const debounceSearch = () => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
        currentPage.value = 1;
        getData();
    }, 500);
}

const isSearching = computed(() => {
    return search.value !== "";
});

watch(search, () => {
    debounceSearch();
})

watch(perPage, () => {
    currentPage.value = 1;
    getData();
})


// Modal tambah & edit data
const showModal = ref(false);
const isEdit = ref(false);
const editId = ref(null);

const form = ref({
    name: '',
    symbol: '',
    description: '',
});

const opemModal = async () => {
    isEdit.value = false;
    editId.value = null;
    loading.value = false;

    form.value = {
        name: '',
        symbol: '',
        description: '',
    }

    errors.value = {};

    showModal.value = true;
}

const openEditModal = async (item) => {
    isEdit.value = true;
    editId.value = item.id;
    loading.value = false;

    form.value = {
        name: item.name,
        symbol: item.symbol,
        description: item.description,
    };

    errors.value = {};

    showModal.value = true;
}

const closeModal = async () => {
    showModal.value = false,

        isEdit.value = false,
        editId.value = null;

    form.value = {
        name: '',
        symbol: '',
        description: '',
    }

    errors.value = {};
}


const saveData = async () => {
    message.value = "";
    errors.value = {};

    if (!form.value.name) {
        errors.value.name = ["Nama harus diisi"];
    }

    if (!form.value.symbol) {
        errors.value.symbol = ["Symbol harus diisi"];
    }

    if (!form.value.description) {
        errors.value.description = ["Deskripsi harus diisi"];
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        loading.value = true;

        const editing = isEdit.value;

        const formData = new FormData();

        formData.append('name', form.value.name);
        formData.append('symbol', form.value.symbol);
        formData.append('description', form.value.description);

        if (editing) {
            formData.append("_method", "PUT");

            await updateSatuans(editId.value, formData);
        } else {
            for (const [key, value] of formData.entries()) {
                console.log(key, value);
            }

            await createSatuans(formData);
        }

        closeModal();

        await getData();

        toast("success", editing ? "Data Satuan berhasil diperbarui." : "Data satuan berhasil ditambah.");
    } catch (error) {
        console.log(error)

        if (error.response.status === 422) {
            errors.value = error.response.data.errors || {};

            return;
        }

        toast("error", error.response?.data?.message || "Gagal menambahkan data satuan");
    } finally {
        loading.value = false;
    }
}

const deleteData = async (id) => {
    const result = await Swal.fire({
        title: "Apakah Anda Yakin.?",
        text: "Data yang sudah dihapus tidak dapat dikembalikan.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
        await deleteSatuans(id);

        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Data berhasil dihapus",
            showConfirmButton: false,
            timer: 3000,
        });

        getData();
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Ooooopss...",
            text: "Gagal menghapus data",
        })

        console.log(error)
    }
}

onMounted(() => {
    getData();
})

</script>

<template>
    <div class="container-fluid">
        <div class="title d-flex align-items-center justify-content-between">
            <h4>Data Satuan</h4>
            <div class="route">
                <button @click="opemModal" class="btn btn-outline-primary">Tambah Data</button>
            </div>
        </div>
        <div class="table-scroll">
            <table class="table table-bordered table-striped mt-2">
                <thead class="bg-primary">
                    <tr>
                        <th width="5%" class="text-white">No</th>
                        <th class="text-white">Nama</th>
                        <th class="text-white">Symbol</th>
                        <th class="text-white text-center">Deskripsi</th>
                        <th class="text-center text-white">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="satuans.length > 0" v-for="(item, index) in satuans" :key="item.id">
                        <td class="text-center">{{ (currentPage - 1) * perPage + index + 1 }}</td>
                        <td class="text-center">{{ item.name }}</td>
                        <td class="text-center">{{ item.symbol }}</td>
                        <td>{{ item.description }}</td>
                        <td class="text-center">
                            <button @click="openEditModal(item)" class="btn btn-outline-warning btn-sm mx-1"><i
                                    class="fas fa-pen-to-square"></i></button>
                            <button @click="deleteData(item.id)" class="btn btn-outline-danger btn-sm"><i
                                    class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                    <tr v-else-if="loading">
                        <td colspan="5" class="text-center">
                            <p class="spinner-border text-primary mt-5"></p>
                            <p class="text-muted">Sedang Memuat...</p>
                        </td>
                    </tr>
                    <tr v-else>
                        <td colspan="5" class="text-center">
                            <i class="fas fa-folder-closed fa-3x text-muted"></i>
                            {{ isSearching ? 'Data tidak ditemukan' : 'Belum ada data' }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>


    <!-- Modal tambah && edit data satuan -->
    <Transition name="modal">
        <div v-if="showModal" class="modal" tabindex="-1" style="display: block;">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ isEdit ? 'Edit Data Satuan' : 'Tambah Data Satuan' }}</h5>
                    </div>

                    <div class="modal-body">
                        <form @submit.prevent="saveData">
                            <div class="form-group">
                                <label for="">Nama</label>
                                <input type="text" v-model="form.name" class="form-control"
                                    :class="{ 'is-invalid': errors.name }" placeholder="Masukkan Nama Satuan">
                                <small class="text-danger" v-if="errors.name">{{ errors.name[0] }}</small>
                            </div>
                            <div class="form-group">
                                <label for="">Symbol</label>
                                <input type="text" v-model="form.symbol" class="form-control"
                                    :class="{ 'is-invalid': errors.symbol }" placeholder="Masukkan Symbol Satuan">
                                <small class="text-danger" v-if="errors.symbol">{{ errors.symbol[0] }}</small>
                            </div>
                            <div class="form-group">
                                <label for="">Deskripsi</label>
                                <input type="text" v-model="form.description" class="form-control"
                                    :class="{ 'is-invalid': errors.description }" placeholder="Masukkan Deskripsi">
                                <small class="text-danger" v-if="errors.description">{{ errors.description[0] }}</small>
                            </div>
                            <div class="modal-footer">
                                <button type="button" @click="closeModal" class="btn btn-danger"
                                    data-bs-dismiss="modal">Batal</button>
                                <button type="submit" class="btn btn-primary" :disabled="loading">{{ loading ?
                                    'Prosess Menyimpan...' : isEdit ? 'Edit' : 'Simpan' }}</button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    </Transition>

    <Transition name="backdrop">
        <div v-if="showModal" class="modal-backdrop fade show"></div>
    </Transition>
</template>

<style scoped>
.table-scroll {
    width: 100%;
    overflow: auto;
    white-space: nowrap;
}
</style>