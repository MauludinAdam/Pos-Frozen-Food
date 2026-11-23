<script setup>
import Sidebar from '@/components/Sidebar.vue';
import Navbar from '@/components/Navbar.vue';
// import Footer from '@/components/Footer.vue';

</script>

<template>

    <!-- Sidebar starts -->
    <Sidebar />
    <!-- Sidebar ends -->

    <!-- Navbar Starts -->
    <Navbar />
    <!-- Navbar ends -->
    <!-- [ Main Content ] start -->
    <div class="pc-container">
        <div class="pc-content">
            <!-- [ Main Content ] start -->
            <RouterView />
        </div>
    </div>
    <!-- [ Main Content ] end -->

    <!-- footer starts -->
    <!-- <Footer /> -->
    <!-- footer ends -->

</template>