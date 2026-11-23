<script setup>
import imageDefault from '@/assets/images/default.avif'
import { getCategoriesOptions } from '@/services/CategoryApi';
import { getProduct, updateProduct } from '@/services/ProductApi';
import { getSatuanOptions } from '@/services/SatuanApi';
import { toast } from '@/utils/Swal';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const errors = ref({});
const message = ref("");

const categories = ref([]);
const satuans = ref([]);



const imagesPreview = ref(null);

const form = ref({
    code: '',
    category_id: '',
    satuan_id: '',
    name: '',
    price: '',
    stock: '',
    description: '',
    image: null,
})

const getData = async () => {
    try {
        const response = await getProduct(route.params.id);

        const product = response.data.data;

        form.value = {
            code: product.code ?? '',
            category_id: product.category_id ?? '',
            satuan_id: product.satuan_id ?? '',
            name: product.name ?? '',
            price: product.price ?? '',
            stock: product.stock ?? '',
            description: product.description ?? '',
            image: null,
        };

        imagesPreview.value = product.image ?? null;

    } catch (error) {
        console.log(error)
    }
}

const handleChange = (event) => {
    const file = event.target.files[0] ?? null;

    if (!file) {
        return;
    }

    if (!file.type.startsWith('image/')) {
        toast("error", "File harus berupa gambar");
        event.target.value = "";
        return;
    }

    form.value.image = file;

    imagesPreview.value = URL.createObjectURL(file);

    delete errors.value.image;
}

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

const updateData = async () => {
    loading.value = true;
    errors.value = {};
    message.value = "";

    try {
        const formData = new FormData();

        Object.keys(form.value).forEach((key) => {
            if (form.value[key] !== null && form.value[key] !== "") {
                formData.append(key, form.value[key]);
            }
        });

        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        formData.append("_method", "PUT");

        await updateProduct(route.params.id, formData);

        toast("success", "Data product berhasil diperbarui");

        router.push({
            name: 'product',
        });
    } catch (error) {
        if (error.response?.status === 422) {
            toast("error", "Periksa kembali data yang diinput");

            errors.value = error.response.data.errors;
        } else {
            toast("error", "Terjadi kesalahan saat memperbarui product")
        }

        console.log(error);
    } finally {
        loading.value = false;
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
        <div class="title">
            <h4>Edit Data Product</h4>
            <hr>
        </div>
        <form @submit.prevent="updateData">
            <div class="row">
                <div class="col-md-4">
                    <div class="image mb-2">
                        <img :src="imagesPreview || imageDefault" alt="" width="180" height="165">
                    </div>
                    <div class="form-group">
                        <label for="">Gambar</label>
                        <input type="file" class="form-control" @change="handleChange" accept="image/*">
                    </div>
                </div>
                <div class="col-md-8">
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
                                <select class="form-control" v-model="form.category_id">
                                    <option v-for="item in categories" :value="item.id" :key="item.id">{{ item.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group">
                                <label for="">Satuan</label>
                                <select class="form-control" v-model="form.satuan_id">
                                    <option v-for="item in satuans" :value="item.id" :key="item.id">{{ item.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="">Nama Product</label>
                                <input type="text" v-model="form.name" class="form-control">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="">Harga</label>
                                <input type="text" v-model="form.price" class="form-control">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="">Stok</label>
                                <input type="text" v-model="form.stock" class="form-control">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="">Deskripsi</label>
                                <input type="text" v-model="form.description" class="form-control">
                            </div>
                        </div>
                        <div class="d-flex gap-1">
                            <RouterLink :to="{ name: 'product' }" class="btn btn-warning">Kembali</RouterLink>
                            <button class="btn btn-primary">Update</button>
                        </div>
                    </div>
                </div>

            </div>
        </form>
    </div>
</template>