<script setup>
import { createCategories, deleteCategories, getCategories, updateCategories } from '@/services/CategoryApi';
import { toast } from '@/utils/Swal';
import Swal from 'sweetalert2';
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();

const loading = ref(false);
const errors = ref({});
const message = ref("");

const categories = ref([]);

const search = ref('');

// pagination
const currentPage = ref(1);
const perPage = ref(10);
const lastPage = ref(1);
const totalData = ref(0);

const getData = async () => {
    try {
        loading.value = true;
        errors.value = {};
        message.value = '';

        const response = await getCategories({
            page: currentPage.value,
            row_per_page: perPage.value,
            search: search.value || null,
        });

        console.log(response.data);

        categories.value = response.data.data.data;

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
const debounceSeearch = () => {
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
    debounceSeearch();
})

watch(perPage, () => {
    currentPage.value = 1;
    getData();
})


// modal tambah & edit data
const showModal = ref(false);
const isEdit = ref(false);
const editId = ref(null);

const form = ref({
    name: '',
    description: '',
});

const openModal = async () => {
    isEdit.value = false;
    editId.value = null;
    loading.value = false;

    form.value = {
        name: '',
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
        description: item.description,
    };

    errors.value = {};

    showModal.value = true;
}

const closeModal = async () => {
    showModal.value = false,

        isEdit.value = false,
        editId.value = null,

        form.value = {
            name: '',
            description: '',
        }

    errors.value = {};

}

const saveData = async () => {
    message.value = "";
    errors.value = {};

    if (!form.value.name) {
        errors.value.name = ["Nama harus diisi"]
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        loading.value = true;

        const editing = isEdit.value;

        const formData = new FormData();

        formData.append('name', form.value.name);
        formData.append('description', form.value.description);

        if (editing) {
            formData.append("_method", "PUT");

            await updateCategories(editId.value, formData);
        } else {
            for (const [key, value] of formData.entries()) {
                console.log(key, value);
            }

            await createCategories(formData);
        }

        closeModal();

        await getData();

        toast("success", editing ? "Data kategori berhasil diperbarui." : "Data kategori berhasil ditambahkan.");

    } catch (error) {
        console.log(error)

        if (error.response.status === 422) {
            errors.value = error.response.data.errors || {};
            return;
        }

        toast("error", error.response?.data?.message || "Gagal menambahakan data kategori");
    } finally {
        loading.value = false;
    }
}

const deleteData = async (id) => {
    const result = await Swal.fire({
        title: "Apakah Anda Yakin ?",
        text: "Data yang sudah dihapus tidak dapat dikembalikan.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal"
    });

    if (!result.isConfirmed) return;

    try {
        await deleteCategories(id);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Data berhasil dihapus',
            showConfirmButton: false,
            timer: 3000,
        });

        getData();
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Oooopss....',
            text: 'Gagal menghapus data',
        })

        console.log(error);
    }
}

onMounted(() => {
    getData();
})

</script>

<template>
    <div class="container-fluid">
        <div class="d-flex align-items-center justify-content-between">
            <h4>Data Kategori</h4>
            <button @click="openModal" class="btn btn-outline-primary">Tambah Data</button>
        </div>
        <div class="table-scroll">
            <table class="table table-bordered table-striped mt-2">
                <thead class="bg-primary">
                    <tr>
                        <th class="text-white" width="5%">No</th>
                        <th class="text-white">Nama</th>
                        <th class="text-center text-white">Deskripsi</th>
                        <th width="15%" class=" text-center text-white">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="categories.length > 0" v-for="(item, index) in categories" :key="item.id">
                        <td class="text-center">{{ (currentPage - 1) * perPage + index + 1 }}</td>
                        <td>{{ item.name }}</td>
                        <td class="text-center">{{ item.description }}</td>
                        <td width="12%" class="text-center">
                            <button @click="openEditModal(item)" class="btn btn-outline-warning btn-sm mx-1"><i
                                    class="fas fa-pen-square"></i></button>
                            <button @click="deleteData(item.id)" class="btn btn-outline-danger btn-sm"><i
                                    class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                    <tr v-else-if="loading">
                        <td colspan="4" class="text-center">
                            <p class="spinner-border text-primary mt-5"></p>
                            <p class="text-muted">Sedang Memuat...</p>
                        </td>
                    </tr>
                    <tr v-else>
                        <td colspan="4" class="text-center">
                            <i class="fas fa-folder-closed fa-3x text-muted"></i><br>
                            {{ isSearching ? 'Data tidak ditemukan' : 'Belum ada data' }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>


    <!-- Modal tambah && edit data -->
    <Transition name="modal">
        <div v-if="showModal" class="modal" tabindex="-1" style="display: block;">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ isEdit ? 'Edit Data Kategori' : 'Tambah Data Kategori' }}</h5>
                        <button type="button" @click="closeModal" class="btn-close" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="saveData">
                            <div class="form-group">
                                <label for="">Nama</label>
                                <input type="text" v-model="form.name" class="form-control"
                                    :class="{ 'is-invalid': errors.name }" placeholder="Masukkan Nama Kategori">
                                <small class="text-danger" v-if="errors.name">{{ errors.name[0] }}</small>
                            </div>
                            <div class="form-group">
                                <label for="">Deskripsi</label>
                                <input type="text" v-model="form.description" class="form-control"
                                    :class="{ 'is-invalid': errors.description }" placeholder="Masukkan Deskripsi">
                                <small class="text-danger" v-if="errors.description">{{ errors.description[0] }}</small>
                            </div>
                            <div class="modal-footer">
                                <button type="submit" @click="closeModal" class="btn btn-danger"
                                    data-bs-dismiss="modal">Batal</button>
                                <button type="submit" class="btn btn-primary" :disabled="loading">{{ loading ?
                                    'Prosess Menyimpan...' : isEdit ? 'Update' : 'Simpan' }}</button>
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
    width: 100;
    overflow: auto;
    white-space: nowrap;
}
</style>