'use client';

import { useTransition } from '@/hooks/useTransition';
import { decodeLabel } from '@/utils/utils';
import { Box } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useEffect, useRef, Suspense } from 'react';
import { componentMap } from '@/constants/Components';
import SkeletonLoader from '@/components/common/Misc/SkeletonLoader';
import BackToTopButton from '@/components/common/Misc/BackToTopButton';
import Header from '@/components/navs/Header';
import Sidebar from '@/components/navs/Sidebar';

export default function CategorySubcategoryPage() {
    const params = useParams();
    const subcategory = params?.subcategory as string;
    const { transitionPhase } = useTransition();

    const scrollRef = useRef<HTMLDivElement>(null);
    const decodedLabel = decodeLabel(subcategory);
    const isLoading = transitionPhase === 'loading';
    const opacity = ['fade-out', 'loading'].includes(transitionPhase) ? 0 : 1;

    // Use dynamic import for the component based on subcategory
    const SubcategoryComponent = subcategory ? dynamic(componentMap[subcategory] as any, {
        loading: () => <SkeletonLoader />,
    }) : null;

    useEffect(() => {
        if (scrollRef.current && transitionPhase !== 'fade-out') {
            scrollRef.current.scrollTo(0, 0);
        }
    }, [subcategory, transitionPhase]);

    return (
        <main className="app-container">
            <Header />
            <section className="category-wrapper">
                <Sidebar />
                <Box className={`category-page ${isLoading ? 'loading' : ''}`} ref={scrollRef} flex="1">
                    <Box className="page-transition-fade" style={{ opacity }}>
                        <Box className="header-container" width="100%" display="flex" justifyContent="space-between" alignItems="center">
                            <h2 className='sub-category'>{decodedLabel}</h2>
                        </Box>

                        <Suspense fallback={<SkeletonLoader />}>
                            {SubcategoryComponent && <SubcategoryComponent />}
                        </Suspense>
                    </Box>
                    <BackToTopButton />
                </Box>
            </section>
        </main>
    );
}
