<script setup>
import logo from '@/assets/images/logo.jpg'
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

</script>

<template>
    <nav class="pc-sidebar" style="background: #2563eb;">
        <div class="navbar-wrapper">
            <div class="m-header mt-3">
                <!-- ========   Change your logo from here   ============ -->
                <img :src="logo" class="rounded-circle" width="64" alt="logo">
                <a class="b-brand mx-2">
                    <h4 class="text-white">Inventory</h4>
                    <small class="text-white fw-bold text-center">POINT OF SALES</small>
                </a>
            </div>
            <hr>
            <div class="navbar-content" style="color: #fff;">
                <ul class="pc-navbar" style="margin-bottom: 5rem;">

                    <li class="pc-item mx-4">
                        <h5 style="color: #A9A9A9;">Menu Utama</h5>
                    </li>
                    <li class="pc-item">
                        <RouterLink :to="{ name: 'dashboard' }" class="pc-link"
                            :class="{ active: route?.name?.startsWith('dashboard') }">
                            <span class="pc-micon text-white"><i class="ti ti-dashboard"></i></span>
                            <span class="pc-mtext text-white">Dashboard</span>
                        </RouterLink>
                    </li>
                    <li class="pc-item">
                        <RouterLink :to="{ name: 'category' }" class="pc-link">
                            <span class="pc-micon text-white"><i class="fas fa-bars"></i></span>
                            <span class="pc-mtext text-white">Category</span>
                        </RouterLink>
                    </li>
                    <li class="pc-item">
                        <RouterLink :to="{ name: 'satuan' }" class="pc-link">
                            <span class="pc-micon text-white"><i class="fa-brands fa-unity"></i></span>
                            <span class="pc-mtext text-white">Satuan</span>
                        </RouterLink>
                    </li>
                    <li class="pc-item">
                        <RouterLink :to="{ name: 'product' }" class="pc-link">
                            <span class="pc-micon text-white"><i class="fa-brands fa-product-hunt"></i></span>
                            <span class="pc-mtext text-white">Product</span>
                        </RouterLink>
                    </li>
                    <li class="pc-item">
                        <RouterLink :to="{ name: 'transaction' }" class="pc-link">
                            <span class="pc-micon text-white"><i class="fa-solid fa-cash-register"></i></span>
                            <span class="pc-mtext text-white">POS / Kasir</span>
                        </RouterLink>
                    </li>
                    <li class="pc-item">
                        <RouterLink :to="{ name: 'riwayat-transaction' }" class="pc-link">
                            <span class="pc-micon text-white"><i class="fas fa-bookmark"></i></span>
                            <span class="pc-mtext text-white">Riwayat Transaksi</span>
                        </RouterLink>
                    </li>
                    <li class="pc-item">
                        <RouterLink :to="{ name: 'laporan-transaction' }" class="pc-link">
                            <span class="pc-micon text-white"><i class="fas fa-file-lines"></i></span>
                            <span class="pc-mtext text-white">Laporan Penjualan</span>
                        </RouterLink>
                    </li>

                    <li class="pc-item pc-caption">
                        <h4 style="color: #A9A9A9;">Inventory</h4>
                        <i class="ti ti-news"></i>
                    </li>

                    <li class="pc-item">
                        <RouterLink :to="{ name: 'stock-transaction' }" class="pc-link">
                            <span class="pc-micon text-white"><i class="fa-solid fa-cash-register"></i></span>
                            <span class="pc-mtext text-white">Stok Transaksi</span>
                        </RouterLink>
                    </li>
                    <li class="pc-item">
                        <RouterLink :to="{ name: 'supplier' }" class="pc-link">
                            <span class="pc-micon text-white"><i class="fas fa-warehouse"></i></span>
                            <span class="pc-mtext text-white">Supplier</span>
                        </RouterLink>
                    </li>
                    <li class="pc-item">
                        <RouterLink class="pc-link">
                            <span class="pc-micon text-white"><i class="fas fa-shopping-cart"></i></span>
                            <span class="pc-mtext text-white">Purchase Order</span>
                        </RouterLink>
                    </li>
                    <li class="pc-item">
                        <RouterLink :to="{ name: 'product' }" class="pc-link">
                            <span class="pc-micon text-white"><i class="fas fa-circle-right"></i></span>
                            <span class="pc-mtext text-white">Penerima Barang</span>
                        </RouterLink>
                    </li>
                    <li class="pc-item">
                        <RouterLink :to="{ name: 'product' }" class="pc-link">
                            <span class="pc-micon text-white"><i class="fa-solid fa-cash-register"></i></span>
                            <span class="pc-mtext text-white">Stok Opname</span>
                        </RouterLink>
                    </li>
                    <li class="pc-item">
                        <RouterLink :to="{ name: 'product' }" class="pc-link">
                            <span class="pc-micon text-white"><i class="fas fa-file"></i></span>
                            <span class="pc-mtext text-white">Laporan</span>
                        </RouterLink>
                    </li>

                    <li class="pc-item pc-caption">
                        <h4 style="color: #A9A9A9;">Setting</h4>
                        <i class="ti ti-news"></i>
                    </li>

                    <li class="pc-item">
                        <RouterLink :to="{ name: 'product' }" class="pc-link">
                            <span class="pc-micon text-white"><i class="fa-solid fas fa-users"></i></span>
                            <span class="pc-mtext text-white">Data User</span>
                        </RouterLink>
                    </li>
                    <li class="pc-item">
                        <RouterLink :to="{ name: 'product' }" class="pc-link">
                            <span class="pc-micon text-white"><i class="fas fa-gears"></i></span>
                            <span class="pc-mtext text-white">Pengaturan</span>
                        </RouterLink>
                    </li>

                    <li class="pc-item">
                        <RouterLink :to="{ name: 'product' }" class="pc-link">
                            <span class="pc-micon text-white"><i
                                    class="fa-solid fa-person-military-to-person"></i></span>
                            <span class="pc-mtext text-white">Role & Permission</span>
                        </RouterLink>
                    </li>


                </ul>
            </div>
        </div>
    </nav>
</template>