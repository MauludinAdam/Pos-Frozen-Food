<script setup>
import { createSupplier, deleteSupplier, getGenerateNumber, getSuppliers, updateSupplier } from '@/services/SupplierApi';
import { toast } from '@/utils/Swal';
import Swal from 'sweetalert2';
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const loading = ref(false);
const errors = ref({});
const message = ref("");

const suppliers = ref([]);

const search = ref('');


// paginations
const currentPage = ref(1);
const perPage = ref(10);
const lastPage = ref(1);
const totalData = ref(0);

// ambil data dari database untuk ditampilkan
const getData = async () => {
    loading.value = true;
    errors.value = {};
    message.value = "";

    try {
        const response = await getSuppliers({
            page: currentPage.value,
            row_per_page: perPage.value,
            search: search.value || null,
        });

        console.log(response.data.data);

        suppliers.value = response.data.data.data;

        currentPage.value = response.data.data.meta.current_page;
        lastPage.value = response.data.data.meta.last_page;
        totalData.value = response.data.data.total;

    } catch (error) {
        console.log(error)
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
    return search.value.trim() !== "";
});

watch(search, () => {
    debounceSearch();
});

watch(perPage, () => {
    currentPage.value = 1;
    getData();
})

// menampilkan modal untuk tambah && edit data
const showModal = ref(false);
const isEdit = ref(false);
const editId = ref(null);

const form = ref({
    code: '',
    name: '',
    phone: '',
    email: '',
    is_active: '',
    note: '',
    address: '',
});

const fetchSupplierNumber = async () => {
    try {
        const response = await getGenerateNumber();

        form.value.code = response.data.data.code;

    } catch (error) {
        console.log(error);
    }
}

const openModal = async () => {
    isEdit.value = false;
    editId.value = null;
    loading.value = false;

    form.value = {
        code: '',
        name: '',
        phone: '',
        email: '',
        is_active: '',
        note: '',
        address: '',
    }

    errors.value = {};

    await fetchSupplierNumber();

    showModal.value = true;
}

const closeModal = async () => {
    showModal.value = false,

        isEdit.value = false,
        editId.value = null,

        form.value = {
            name: '',
            phone: '',
            email: '',
            is_active: '',
            note: '',
            address: '',
        }

    errors.value = {};
}

const openEditModal = async (item) => {
    isEdit.value = true;
    editId.value = item.id;
    loading.value = false;

    form.value = {
        code: item.code,
        name: item.name,
        phone: item.phone,
        email: item.email,
        is_active: item.is_active,
        note: item.note,
        address: item.address,
    }

    errors.value = {};

    showModal.value = true;
}

const saveData = async () => {
    message.value = "";
    errors.value = {};

    if (!form.value.name) {
        errors.value.name = ["Nama harus diisi"];
    }

    if (!form.value.phone) {
        errors.value.phone = ["No.Telp harus diisi"];
    }

    if (!form.value.email) {
        errors.value.email = ["Email harus diisi"]
    }

    if (!form.value.is_active) {
        errors.value.is_active = ["Status harus diisi"];
    }

    if (!form.value.address) {
        errors.value.address = ["Alamat harus diisi"];
    }

    if (!form.value.note) {
        errors.value.note = ["Note harus diisi"];
    }

    if (Object.keys(errors.value).length > 0) {
        return;
    }

    try {
        loading.value = true;

        const editing = isEdit.value;

        const formData = new FormData();

        formData.append('name', form.value.name);
        formData.append('phone', form.value.phone);
        formData.append('email', form.value.email);
        formData.append('is_active', form.value.is_active);
        formData.append('note', form.value.note);
        formData.append('address', form.value.address);

        if (editing) {
            formData.append("_method", "PUT");

            await updateSupplier(editId.value, formData);
        } else {
            for (const [key, value] of formData.entries()) {
                console.log(key, value);
            }

            await createSupplier(formData);
        }

        closeModal();

        await getData();

        toast("success", editing ? "Data supplier berhasil di perbarui" : "Data supplier berhasil ditambahkan.");
    } catch (error) {
        console.log(error);

        if (error.response.status === 422) {
            errors.value = error.response.data.errors || {};
            return;
        }

        toast("error", error.response?.data?.message || "Gagal menambahkan data supplier");
    } finally {
        loading.value = false;
    }
}

// Hapus Data
const deleteData = async (id) => {
    const result = await Swal.fire({
        title: "Apakah Anda Yakin.?",
        text: "Data yang sudah dihapus tidak dapat dikembalikan.!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
    });

    if (!result.isConfirmed)
        return;

    try {
        await deleteSupplier(id);

        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Data berhasil dihapus",
            showConfirmButton: false,
            timer: 3000
        });

        getData();
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Ooooopss....",
            text: "Gagal menghapus data.",
        });

        console.log(error);
    }
}

onMounted(() => {
    getData();
})

</script>

<template>
    <div class="container-fluid">
        <div class="card">
            <div class="card-header d-flex align-items-center justify-content-between p-3">
                <div class="card-title">
                    <h4>Data Suppliers</h4>
                </div>
                <div class="add-data-suppliers">
                    <button @click="openModal" class="btn btn-primary"><i class="fas fa-plus"></i> Tambah Data</button>
                </div>
            </div>
            <div class="card-body">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="page">
                        <select class="form-select">
                            <option :value="10">10</option>
                            <option :value="25">25</option>
                            <option :value="50">50</option>
                            <option :value="100">100</option>
                        </select>
                    </div>
                    <div class="search d-flex gap-1 align-items-center justify-content-center">
                        <label for="">Cari:</label>
                        <input type="text" v-model="search" class="form-control" placeholder="Cari....">
                    </div>
                </div>
                <div class="table-scroll">
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>No. Supplier</th>
                                <th>Nama Supplier</th>
                                <th>No. Telp</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Note</th>
                                <th>Alamat</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="loading">
                                <td colspan="9" class="text-center py-5">
                                    <p class="spinner spinner-border text-primary"></p>
                                    <p class="text-muted">Sedang Memuat....</p>
                                </td>
                            </tr>
                            <tr v-else-if="suppliers.length === 0">
                                <td colspan="9" class="text-center py-5">
                                    <p class="text-muted"><i class="fas fa-folder-closed fa-3x"></i></p>
                                    <p class="text-muted fs-5">{{ isSearching ? 'Data tidak ditemukan.!' :
                                        'Data masih kosong.!' }}</p>
                                </td>
                            </tr>
                            <tr v-else v-for="(item, index) in suppliers" :key="item.id">
                                <td>{{ (currentPage - 1) * perPage + index + 1 }}</td>
                                <td>{{ item.code }}</td>
                                <td>{{ item.name }}</td>
                                <td>{{ item.phone }}</td>
                                <td>{{ item.email }}</td>
                                <td>{{ item.is_active === 1 ? 'Aktif' : 'Non Aktif' }}</td>
                                <td>{{ item.note }}</td>
                                <td>{{ item.address }}</td>
                                <td>
                                    <button @click="openEditModal(item)" class="btn btn-outline-warning btn-sm mx-1"><i
                                            class="fas fa-pen-square"></i></button>
                                    <button @click="deleteData(item.id)" class="btn btn-outline-danger btn-sm"><i
                                            class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="d-flex align-items-center justify-content-between">
                    <div class="page">
                        <span>Halaman {{ currentPage }} dari {{ lastPage }}</span>
                    </div>
                    <div class="pagination">
                        <nav aria-label="nav">
                            <ul class="pagination">
                                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                    <button class="page-link" @click="changePage(currentPage - 1)">Previous</button>
                                </li>
                                <li class="page-item" v-for="page in lastPage" :key="page"
                                    :class="{ active: currentPage === page }">
                                    <button class="page-link" @click="changePage(page)">{{ page }}</button>
                                </li>
                                <li class="page-item" :class="{ disabled: currentPage === lastPage }">
                                    <button class="page-link" @click="changePage(currentPage + 1)">Next</button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Add Suppliers Starts -->
    <Transition name="modal">
        <div v-if="showModal" class="modal" tabindex="-1" style="display: block;">
            <div class="modal-dialog modal-dialog-centered modal-lg ">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ isEdit ? 'Edit Data Supplier' : 'Tambah Data Supplier' }}</h5>
                        <button type="button" @click="closeModal" class="btn-close" data-bs-dismiss="modal"
                            aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="saveData">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="mb-2">No. Supplier</label>
                                        <input type="text" v-model="form.code" class="form-control" readonly>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label for="" class="mb-2">Nama Supplier</label>
                                        <input type="text" v-model="form.name" class="form-control"
                                            :class="{ 'is-invalid': errors.name }" placeholder="Masukkan Nama Supplier">
                                        <small class="text-danger" v-if="errors.name">{{ errors.name[0] }}</small>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label for="" class="mb-2">No.Telp</label>
                                        <input type="text" v-model="form.phone" class="form-control"
                                            :class="{ 'is-invalid': errors.phone }" placeholder="Masukkan No. Telp">
                                        <small class="text-danger" v-if="errors.phone">{{ errors.phone[0] }}</small>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label for="" class="mb-2">Email</label>
                                        <input type="email" v-model="form.email" class="form-control"
                                            :class="{ 'is-invalid': errors.email }" placeholder="Masukkan Email">
                                        <small class="text-danger" v-if="errors.email">{{ errors.email[0] }}</small>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label for="" class="mb-2">Status</label>
                                        <select class="form-control" v-model="form.is_active"
                                            :class="{ 'is-invalid': errors.is_active }">
                                            <option value="">--- Pilih ---</option>
                                            <option value="1">Aktif</option>
                                            <option value="0">No Aktif</option>
                                        </select>
                                        <small class="text-danger" v-if="errors.is_active">{{ errors.is_active[0]
                                        }}</small>
                                    </div>
                                </div>
                                <div class="col-md-12">
                                    <div class="form-group">
                                        <label for="" class="mb-2">Note</label>
                                        <textarea rows="2" v-model="form.note" class="form-control"
                                            :class="{ 'is-invalid': errors.note }"
                                            placeholder="Masukkan Catatan"></textarea>
                                        <small class="text-danger" v-if="errors.note">{{ errors.note[0] }}</small>
                                    </div>
                                </div>
                                <div class="col-md-12">
                                    <div class="form-group">
                                        <label for="" class="mb-2">Alamat</label>
                                        <textarea rows="2" v-model="form.address" class="form-control"
                                            :class="{ 'is-invalid': errors.address }"
                                            placeholder="Masukkan alamat lengkap supplier"></textarea>
                                        <small class="text-danger" v-if="errors.address">{{ errors.address[0] }}</small>

                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" @click="closeModal" class="btn btn-danger"
                                    data-bs-dismiss="modal">Batal</button>
                                <button type="submit" class="btn btn-primary" :disabled="loading">{{ loading ?
                                    'Proses Menyimpan...' : isEdit ? 'Update' : 'Simpan' }}</button>
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
    <!-- Modal Add Suppliers Ends -->
</template>

<style scoped>
.table-scroll {
    width: 100%;
    overflow: auto;
    white-space: nowrap;
}
</style>