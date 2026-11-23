<script setup>
import { getCategoriesOptions } from '@/services/CategoryApi';
import { createProduct, generateBarcodeNumber } from '@/services/ProductApi';
import { getSatuanOptions } from '@/services/SatuanApi';
import { toast } from '@/utils/Swal';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();

const loading = ref(false);
const errors = ref({});
const message = ref("");

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

const form = ref({
    code: '',
    category_id: '',
    satuan_id: '',
    name: '',
    price: '',
    stock: '',
    image: null,
    description: '',
});

const generateBarcode = async () => {
    try {
        const response = await generateBarcodeNumber();

        form.value.code = response.data.data.code;
    } catch (error) {
        console.log(error);
    }
}

const handleChange = (event) => {
    const file = event.target.files[0] ?? null;

    if (!file) {
        form.value.image = null;
        return;
    }

    form.value.image = file;

    delete errors.value.image;
}

const saveData = async () => {
    errors.value = {};
    message.value = "";

    if (!form.value.category_id) {
        errors.value.category_id = ["Kategori produk harus diisi"];
    }

    if (!form.value.satuan_id) {
        errors.value.satuan_id = ["Satuan produk harus diisi"];
    }

    if (!form.value.name) {
        errors.value.name = ["Nama produk harus diisi"];
    }

    if (!form.value.price) {
        errors.value.price = ["Harga produk harus diisi"]
    }

    if (!form.value.stock) {
        errors.value.stock = ["Stok produk harus diisi"];
    }

    if (!form.value.image) {
        errors.value.image = ["Gambar produk harus diisi"];
    }

    if (!form.value.description) {
        errors.value.description = ["Deskripsi produk harus diisi"];
    }

    if (Object.keys(errors.value).length > 0) {
        loading.value = false;
        return;
    }

    loading.value = true;

    try {
        const formData = new FormData();

        Object.keys(form.value).forEach((key) => {
            const value = form.value[key];

            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        await createProduct(formData);

        toast("success", "Data product berhasil ditambahkan");

        router.push({
            name: 'product',
        });
    } catch (error) {
        console.log(error)
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchCategories();
    fetchSatuans();
    generateBarcode();
})

</script>

<template>
    <div class="container-fluid">
        <div class="title mb-4">
            <h4>Tambah Data Product</h4>
            <hr>
        </div>
        <form @submit.prevent="saveData">
            <div class="row">
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="">Kode</label>
                        <input type="text" v-model="form.code" class="form-control" readonly>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="">Kategori</label>
                        <select class="form-control" v-model="form.category_id"
                            :class="{ 'is-invalid': errors.category_id }">
                            <option value="">--- Pilih ---</option>
                            <option v-for="item in categories" :value="item.id" :key="item.id">{{ item.name }}</option>
                        </select>
                        <small class="text-danger" v-if="errors.category_id">{{ errors.category_id[0] }}</small>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="">Satuan</label>
                        <select class="form-control" v-model="form.satuan_id"
                            :class="{ 'is-invalid': errors.satuan_id }">
                            <option value="">--- Pilih ---</option>
                            <option v-for="item in satuans" :value="item.id" :key="item.id">{{ item.name }}</option>
                        </select>
                        <small class="text-danger" v-if="errors.satuan_id">{{ errors.satuan_id[0] }}</small>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="">Nama Product</label>
                        <input type="text" v-model="form.name" class="form-control"
                            :class="{ 'is-invalid': errors.name }" placeholder="Masukkan Nama Product">
                        <small class="text-danger" v-if="errors.name">{{ errors.name[0] }}</small>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="">Harga</label>
                        <input type="text" v-model="form.price" class="form-control"
                            :class="{ 'is-invalid': errors.price }" placeholder="Masukkan Harga">
                        <small class="text-danger" v-if="errors.price">{{ errors.price[0] }}</small>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="">Stok</label>
                        <input type="text" v-model="form.stock" class="form-control"
                            :class="{ 'is-invalid': errors.stock }" placeholder="Masukkan Stok">
                        <small class="text-danger" v-if="errors.stock">{{ errors.stock[0] }}</small>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="">Gambar</label>
                        <input type="file" @change="handleChange" class="form-control"
                            :class="{ 'is-invalid': errors.image }" accept="image/*">
                        <small class="text-danger" v-if="errors.image">{{ errors.image[0] }}</small>
                    </div>
                </div>
                <div class="form-group">
                    <label for="">Deskripsi</label>
                    <textarea rows="2" v-model="form.description" class="form-control"
                        :class="{ 'is-invalid': errors.description }"
                        placeholder="Masukkan Deskrips Product"></textarea>
                    <small class="text-danger" v-if="errors.description">{{ errors.description[0] }}</small>
                </div>
                <div class="d-flex gap-1">
                    <RouterLink :to="{ name: 'product' }" class="btn btn-warning">Kembali</RouterLink>
                    <button type="submit" class="btn btn-primary" :disabled="loading">{{ loading ?
                        'Proses Menyimpan...' : 'Simpan' }}</button>
                </div>
            </div>
        </form>
    </div>
</template>