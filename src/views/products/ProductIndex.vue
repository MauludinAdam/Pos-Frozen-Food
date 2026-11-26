<script setup>
import imageDefault from '@/assets/images/default.avif'
import { getCategoriesOptions } from '@/services/CategoryApi';
import { deleteProduct, getProducts } from '@/services/ProductApi';
import { getSatuanOptions } from '@/services/SatuanApi';
import Swal from 'sweetalert2';
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const loading = ref(false);
const message = ref('');
const errors = ref({});

const search = ref('');

const products = ref([]);

const categories = ref([]);
const satuans = ref([]);

const fetchCategories = async () => {
    try {
        const response = await getCategoriesOptions();
        categories.value = response.data.data.data;
    } catch (error) {
        console.log(error);
    }
}

const fetchSatuans = async () => {
    try {
        const response = await getSatuanOptions();

        satuans.value = response.data.data.data;

    } catch (error) {
        console.log(error);
    }
}

// Pagination
const currentPage = ref(1);
const perPage = ref(10)
const lastPage = ref(1)
const totalData = ref(0);

const getData = async () => {
    loading.value = true;
    errors.value = {};
    message.value = '';

    try {

        const response = await getProducts({
            page: currentPage.value,
            row_per_page: perPage.value,
            search: search.value || null,
        });

        console.log(response.data);

        products.value = response.data.data.data;

        currentPage.value = response.data.data.meta.current_page;
        lastPage.value = response.data.data.meta.last_page;
        totalData.value = response.data.data.meta.total;
    } catch (error) {
        console.log(error)
    } finally {
        loading.value = false;
        console.log('Loading selesai:', loading.value);
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
})

watch(perPage, () => {
    currentPage.value = 1;
    getData();
})

// delete data
const deleteData = async (id) => {
    const result = await Swal.fire({
        title: "Apakah Anda Yakin ?",
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
        await deleteProduct(id);

        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Data berhasil dihapus",
            showConfirmButton: false,
            timer: 3000
        })

        getData();
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Ooooops...",
            text: "Gagal menghapus data.",
        });

        console.log(error);
    }
}

onMounted(() => {
    fetchCategories();
    fetchSatuans();
    getData();
})

</script>


<template>
    <div class="container-fluid">
        <div class="title d-flex align-items-center justify-content-between">
            <h4>Data Product</h4>
            <div class="content">
                <RouterLink :to="{ name: 'tambah-data' }" class="btn btn-outline-primary">Tambah Data</RouterLink>
            </div>
        </div>
        <div class="d-flex align-items-center justify-content-between mt-3">
            <div class="perpage d-flex align-items-center gap-1">
                <label for="">Show</label>
                <select v-model="perPage" class="form-select">
                    <option :value="10">10</option>
                    <option :value="25">25</option>
                    <option :value="50">50</option>
                    <option :value="100">100</option>
                </select>
            </div>
            <div class="search d-flex align-items-center gap-1">
                <label for="">Search:</label>
                <input type="text" v-model="search" class="form-control" placeholder="Serach Here...">
            </div>
        </div>
        <div class="table-scroll">
            <table class="table table-bordered table-striped mt-2">
                <thead class="bg-primary">
                    <tr>
                        <th class="text-white" width="5%">No</th>
                        <th class="text-white">Kode</th>
                        <th class="text-white">Kategori</th>
                        <th class="text-white">Satuan</th>
                        <th class="text-white">Nama</th>
                        <th class="text-white">Harga</th>
                        <th class="text-white">Stok</th>
                        <th class="text-white">Gambar</th>
                        <th class="text-white">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="loading">
                        <td colspan="9" class="text-center">
                            <p class="spinner-border text-primary mt-4"></p>
                            <p class="text-muted">Sedang Memuat...</p>
                        </td>
                    </tr>
                    <tr v-else-if="products.length === 0">
                        <td colspan="9" class="text-center py-5">
                            <i class="fas fa-folder-closed fa-3x text-muted"></i><br>
                            {{ isSearching ? 'Data tidak ditemukan' : 'Data masih kosong' }}
                        </td>
                    </tr>
                    <tr v-else v-for="(item, index) in products" :key="item.id">
                        <td class="text-center">{{ (currentPage - 1) * perPage + index + 1 }}</td>
                        <td>{{ item.code }}</td>
                        <td>{{ item.category?.name }}</td>
                        <td class="text-center">{{ item.satuan?.name }}</td>
                        <td>{{ item.name }}</td>
                        <td class="text-end">Rp.{{ item.price }}</td>
                        <td class="text-end">{{ item.stock }}</td>
                        <td>
                            <img :src="item.image || imageDefault" alt="" class="rounded-circle" width="60">
                        </td>
                        <td>
                            <RouterLink :to="{ name: 'edit-product', params: { id: item.id } }"
                                class="btn btn-outline-warning btn-sm mx-1"><i class="fas fa-pen-square"></i>
                            </RouterLink>
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
                <nav aria-label="navigation">
                    <ul class="pagination">
                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                            <button class="page-link" @click="changePage(currentPage - 1)">Previous</button>
                        </li>

                        <li v-for="page in lastPage" :key="page" class="page-item"
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
</template>

<style scoped>
.table-scroll {
    width: 100%;
    overflow: auto;
    white-space: nowrap;
}
</style>